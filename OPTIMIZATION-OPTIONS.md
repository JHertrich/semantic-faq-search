# FAQ Semantic Search — Optimierungsoptionen

Status des Prototypen und mögliche nächste Schritte für einen produktiven Einsatz.

---

## Aktueller Stand

Der Prototyp nutzt das **`.multilingual-e5-small`**-Modell in Elasticsearch als Bi-Encoder. Kernkennzahlen auf dem aktuellen Testset (22 positive + 3 negative Queries):

| Metrik | Wert |
|---|---|
| **Recall** | 100 % — alle relevanten FAQs werden gefunden |
| **Specificity** | 100 % — keine Off-Topic-Ergebnisse |
| **P@1** | 73 % — richtiges FAQ auf Rang 1 |
| **P@3** | 86 % — richtiges FAQ in den Top 3 |

**Bekanntes Kernproblem:** Der Bi-Encoder erzeugt Scores, die sehr eng beieinanderliegen (1.80–1.89). Dadurch ist es schwierig zu unterscheiden, welches FAQ wirklich am besten passt — alle "relevanten" Treffer sehen für das Modell nahezu gleich gut aus. Das führt zu den 27 % Fällen, in denen das richtige FAQ nicht auf Rang 1 landet.

---

## Übersicht: Optimierungsoptionen

| # | Option | Aufwand | Qualitätsgewinn | Datenschutz | Empfehlung |
|---|---|---|---|---|---|
| 1 | **E5-Large-Modell** | Sehr gering | Mittel | Lokal ✓ | Schneller erster Schritt |
| 2 | **Cohere Rerank API** | Gering | Hoch | Extern ✗ | Nur ohne Datenschutzanforderungen |
| 3 | **RRF Hybridsuche** | Mittel | Gering–Mittel | Lokal ✓ | Nur ergänzend sinnvoll |
| 4 | **FAQ-Inhaltserweiterung** | Mittel | Mittel (gezielt) | Lokal ✓ | Parallelmaßnahme |
| 5 | **Eland Cross-Encoder** | Hoch | Hoch | Lokal ✓ | **Empfohlen für Produktion** |

### Elastic-eigene Reranker — warum sie hier nicht passen

Elasticsearch bringt seit 8.16 zwei eingebettete Reranker-Optionen mit, die keinen Eland-Import benötigen:

| Modell | Sprache | Daten lokal? | Geeignet? |
|---|---|---|---|
| **`.rerank-v1`** | Englisch only | Ja — läuft in ES ✓ | Nein — für deutschsprachige Inhalte unbrauchbar |
| **`.jina-reranker-v3`** | Multilingual ✓ | Nein — läuft über Elastic Inference Service (EIS) ✗ | Nein — Daten verlassen die Infrastruktur |

**`.rerank-v1`** wäre ideal (kein Setup-Aufwand, vollständig lokal, identisches API wie Eland-Modelle) — scheitert aber am gleichen Problem wie das früher getestete `ms-marco-MiniLM`: englisches Trainingsset, deutschsprachige Eingaben produzieren unbrauchbare Scores.

**`.jina-reranker-v3`** ist multilingual und qualitativ stark, läuft aber über den Elastic Inference Service — ein von Elastic betriebener Cloud-Dienst. Für Anwendungen mit interner Datenhaltung ist das gleichbedeutend mit der Cohere-API-Option: Daten verlassen den eigenen Cluster.

**Konsequenz:** Für deutschsprachige Inhalte mit interner Datenhaltung führt kein Weg an Option 5 (Eland) vorbei.

---

## Option 1 — E5-Large-Modell-Upgrade

**Aufwand:** Sehr gering  
**Qualitätsgewinn:** Mittel

### Was es tut

Das `.multilingual-e5-small` hat 384 Dimensionen und 117 M Parameter. Das `large`-Modell hat 1024 Dimensionen und 560 M Parameter — es versteht Sprache und semantische Zusammenhänge deutlich differenzierter. Die Scores würden sich besser spreizen, was P@1 verbessern sollte.

### Was sich ändert

Einzige Code-Änderung in `apps/backend/src/elastic/mapping.ts`:

```typescript
// Vorher:
export const INFERENCE_ENDPOINT_ID = 'my-e5-endpoint'; // .multilingual-e5-small

// Nachher: neues Inference Endpoint mit .multilingual-e5-large erstellen
```

Dazu neues Inference Endpoint in Kibana/curl anlegen und den Index neu aufbauen (`npm run setup-index`).

### Trade-offs

| | Small | Large |
|---|---|---|
| Modellgröße | ~470 MB | ~2.2 GB |
| RAM-Bedarf (gesamt Docker) | ~4 GB | ~8 GB |
| Inferenzlatenz pro Query | schnell | ~2–3× langsamer |
| Sprachverständnis | gut | besser |
| Löst Präzisionsproblem? | nein | teilweise |

### Einschränkung

Das Modell bleibt ein **Bi-Encoder** — Query und Dokument werden weiterhin getrennt eingebettet, ohne direkten Vergleich. Das Präzisionsproblem (enge Score-Spreizung) wird gemildert, aber nicht grundsätzlich gelöst. Für 20–50 FAQs ein sinnvoller erster Schritt, bevor komplexere Architekturen eingeführt werden.

---

## Option 2 — Cohere Rerank API (Cross-Encoder via API)

**Aufwand:** Gering  
**Qualitätsgewinn:** Hoch

### Warum Cross-Encoder?

Ein Cross-Encoder verarbeitet **Query und Dokument gemeinsam** — mit gegenseitiger Aufmerksamkeit (Cross-Attention). Dadurch entstehen viel besser gespreizte Scores (z. B. 0.95 für den richtigen Treffer, 0.12 für einen tangential verwandten). Das löst das Kernproblem des Prototypen direkt.

```
Bi-Encoder (aktuell):        Cross-Encoder:
  Query  →  Embedding         Query + Dokument  →  Relevanz-Score
  FAQ    →  Embedding              (zusammen verarbeitet)
  Score  =  Kosinus-Ähnlichkeit    Score = echter Relevanz-Wert
```

### Was sich ändert

1. Cohere-Inference-Endpoint in Kibana Dev Tools anlegen (einmalig):

```
PUT _inference/rerank/my-cohere-reranker
{
  "service": "cohere",
  "service_settings": {
    "api_key": "<API-KEY>",
    "model_id": "rerank-multilingual-v3.0"
  }
}
```

2. Query-Logik in `faq.service.ts` auf `text_similarity_reranker` umstellen (~15 Zeilen)
3. Threshold neu kalibrieren (Cohere-Scores: 0.0–1.0, typisch ~0.3–0.5 als Schwelle)

### Trade-offs

| Aspekt | Bewertung |
|---|---|
| Implementierungsaufwand | Gering — kein lokales Modell, keine Infrastruktur |
| Qualität | Sehr hoch — `rerank-multilingual-v3.0` ist State of the Art |
| Kosten | Kostenlos bis 1.000 Req/Monat; danach $1–2 pro 1.000 Req |
| Datenschutz | **Daten verlassen die eigene Infrastruktur** ⚠ |
| Abhängigkeit | Externer Dienst — Ausfall/API-Änderungen möglich |
| Skalierung | Cohere übernimmt Infrastruktur und Skalierung |

### Wann geeignet

- Prototyp / interne Tools ohne strenge Datenschutzanforderungen
- Schnelle Validierung ob Cross-Encoding das Problem löst (bevor Eland investiert wird)
- Niedrigvolumen-Anwendungen (< 30.000 Req/Monat = unter 30–60 €/Monat)

---

## Option 3 — RRF Hybridsuche (Semantic + BM25)

**Aufwand:** Mittel  
**Qualitätsgewinn:** Gering bis Mittel

### Was es tut

**Reciprocal Rank Fusion** kombiniert semantische Suche mit klassischer Volltextsuche (BM25). Wenn ein Suchwort *wörtlich* im FAQ-Text vorkommt, verstärkt BM25 das Ergebnis.

```
Finales Score = RRF(Semantic-Score, BM25-Score)
```

### Wann es hilft

- Query: "Slack verbinden" → BM25 findet "Slack" direkt im FAQ-Text → starkes Signal
- Query: "Webhooks" → BM25 findet "Webhook" im FAQ-Text → Rang verbessert

### Wann es nicht hilft

- Query: "Kann ich mich mit meinem Firmen-Account anmelden?" → SSO-FAQ enthält "SSO", nicht "Firmen-Account" → kein BM25-Boost
- Semantisch-indirekte Queries profitieren nicht

### Einschätzung für dieses Projekt

Bei 20–50 FAQs bringt RRF **begrenzten Nutzen** — es löst 1–2 der bekannten Problemfälle, schafft aber keine neue Qualitätsstufe. Sinnvoll als **ergänzende Maßnahme** zusammen mit Option 1 oder 5, nicht als primäre Optimierung.

---

## Option 4 — FAQ-Inhaltserweiterung

**Aufwand:** Mittel (redaktionell)  
**Qualitätsgewinn:** Mittel, gezielt

### Was es tut

FAQ-Antworten werden um Synonyme, Umschreibungen und typische User-Formulierungen ergänzt. Da `semantic_text` auf dem gesamten Antworttext eingebettet wird, verbessert sich die semantische Abdeckung direkt.

**Beispiel: SSO-FAQ**

```
Aktuell:
  Frage: "Unterstützt ihr Single Sign-On (SSO)?"
  Antwort: "Ja, wir unterstützen SSO für Enterprise-Konten..."

Erweitert:
  Frage: "Unterstützt ihr Single Sign-On (SSO) für Unternehmensaccounts?"
  Antwort: "Ja, wir unterstützen SSO für Enterprise-Konten.
            Sie können sich mit Ihrem Unternehmens-Account oder
            Firmen-Login anmelden. ..."
```

### Gezielte Fixes für bekannte Problemfälle

| Problematische Query | Betroffenes FAQ | Maßnahme |
|---|---|---|
| "Kann ich mich mit meinem Firmen-Account anmelden?" | SSO (faq-017) | "Firmen-Account", "Unternehmens-Login" in Antwort ergänzen |
| "Kann ich die Plattform mit Slack verbinden?" | Integrationen (faq-010) | "Slack", "verbinden" explizit erwähnen |
| "Automatische Benachrichtigungen bei Ereignissen" | Webhooks (faq-018) | "automatische Benachrichtigungen", "Ereignisse" ergänzen |

### Einschränkung

Funktioniert nur für bekannte Lücken. Neue User-Formulierungen, die nicht antizipiert wurden, bleiben problematisch. Daher **kein Ersatz** für eine bessere Modellarchitektur.

---

## Option 5 — Eland Cross-Encoder (lokal, kein externer Dienst)

**Aufwand:** Hoch  
**Qualitätsgewinn:** Hoch

### Was es tut

Ein mehrsprachiges Cross-Encoder-Modell (`BAAI/bge-reranker-v2-m3`) wird über das **Eland**-Tool in Elasticsearch selbst deployt. Keine externen APIs, keine Daten verlassen die Infrastruktur.

### Architektur

```
User-Query
    │
    ▼
ES: Semantic Retrieval (E5-Small → Top 20 Kandidaten)
    │
    ▼
ES: text_similarity_reranker (BAAI/bge-reranker-v2-m3)
    │  verarbeitet Query + jeden Kandidaten gemeinsam
    ▼
Finales Ranking (Cross-Encoder-Scores: 0.0–1.0)
```

### Implementierungsschritte

1. **Python-Umgebung aufsetzen** (einmalig, außerhalb des Projekts):
   ```bash
   pip install eland elasticsearch transformers torch
   ```

2. **Modell in ES importieren** (~1–2 GB Download, ~5 Min):
   ```bash
   eland_import_hub_model \
     --url http://localhost:9200 \
     --hub-model-id BAAI/bge-reranker-v2-m3 \
     --task-type text_similarity \
     --start
   ```

3. **Inference Endpoint anlegen** (Kibana Dev Tools):
   ```
   PUT _inference/rerank/my-bge-reranker
   {
     "service": "elasticsearch",
     "service_settings": {
       "model_id": "BAAI__bge-reranker-v2-m3",
       "num_allocations": 1,
       "num_threads": 1
     }
   }
   ```

4. **Query in `faq.service.ts` umstellen** (~15 Zeilen, gleiche Änderung wie bei Cohere)

5. **Threshold neu kalibrieren** (`npm run evaluate`)

### Produktive Infrastruktur

Das Modell läuft dauerhaft in Elasticsearch. Für Produktionsbetrieb:

| Ressource | Bedarf |
|---|---|
| RAM (zusätzlich zu E5-Small) | ~1.1 GB |
| RAM gesamt (ES + beide Modelle) | ~5–6 GB |
| CPU | ~100–300 ms zusätzliche Latenz pro Search-Request (CPU-only) |
| Persistenz | Im ES-Volume — überlebt Container-Neustarts, nicht Volume-Löschungen |

### Trade-offs vs. Cohere

| Aspekt | Eland (lokal) | Cohere (API) |
|---|---|---|
| Datenschutz | Vollständig lokal ✓ | Daten zu Cohere ⚠ |
| Einmalaufwand | ~2–4 Stunden | ~1 Stunde |
| Laufende Kosten | Infrastruktur (RAM/CPU) | Per Request (ab Freitier) |
| Verfügbarkeit | Abhängig von eigenem Betrieb | Cohere-SLA |
| Wartung | Modell-Updates manuell | Automatisch durch Cohere |
| Qualität | Sehr gut (bge-reranker-v2-m3) | Ausgezeichnet (State of the Art) |

---

## Empfehlung: Priorisierung für Produktion

> **Rahmenbedingung:** Daten dürfen die eigene Infrastruktur nicht verlassen → Cohere API und Elastic Inference Service (`.jina-reranker-v3`) scheiden aus. Das eingebaute `.rerank-v1` ist englischsprachig und damit ebenfalls ungeeignet.

### Sofort (vor Produktion, geringer Aufwand)

1. **Option 1 — E5-Large** als Drop-in-Ersatz. Modell-ID ändern, Index neu aufbauen, Threshold neu kalibrieren. Verbessert P@1 ohne Architekturänderung.

2. **Option 4 — FAQ-Inhalte** für die 3–5 bekannten Problemfälle gezielt ergänzen. Kein Code, kein Infrastrukturaufwand.

### Produktion (Cross-Encoder)

3. **Option 5 — Eland + `BAAI/bge-reranker-v2-m3`** als permanente Lösung. Vollständig lokal, multilingual, löst das Präzisionsproblem des Bi-Encoders grundsätzlich. Erfordert eine einmalige Python-Umgebung für den Modell-Import (~2–4 Stunden Setup).

   Da Cohere als Validierungsschritt ausscheidet, empfiehlt sich folgender Nachweis vorab: E5-Large (Option 1) mit dem Evaluierungsskript messen. Wenn P@1 danach noch unter 85 % liegt, ist der Eland-Aufwand klar gerechtfertigt.

### Ergänzend

4. **Option 3 — RRF** nur als Ergänzung nach Option 1 oder 5, nicht als primäres Upgrade.

---

## Lizenzhinweis

Der aktuelle `semantic_text`-Feldtyp erfordert eine **Elasticsearch Enterprise- oder Trial-Lizenz** (Trial läuft 30 Tage). Für Produktion entweder:
- Enterprise-Lizenz beschaffen, oder
- Auf `dense_vector` + externe Embedding-Generierung umsteigen (im Repo als Alternative dokumentiert) — läuft mit der kostenlosen Basic-Lizenz

Die Cross-Encoder-Optionen (2 und 5) sind ebenfalls nur mit Enterprise/Trial verfügbar, da sie den `text_similarity_reranker`-Retriever nutzen.
