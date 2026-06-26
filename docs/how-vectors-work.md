# Wie Vektoren in der semantischen Suche funktionieren

## Ein Wort = eine Position im Raum

Stell dir vor, jedes Wort bekommt eine Position in einem Koordinatensystem. Mit zwei Dimensionen könnte das so aussehen:

```
       "Katze"
          │
          │        "Hund"
          │
──────────┼────────────────
          │
   "Auto" │       "Fahrrad"
          │
```

Wörter mit ähnlicher Bedeutung landen **nah beieinander**. "Katze" und "Hund" sind nah (beide Tiere), "Auto" und "Fahrrad" sind nah (beide Fahrzeuge) — aber Tiere und Fahrzeuge sind weit voneinander entfernt.

---

## In der Praxis: viele Dimensionen

Statt 2 Dimensionen (x, y) nutzt das E5-Modell **384 Dimensionen**. Jede Dimension kodiert eine abstrakte Eigenschaft der Sprache — nicht mehr so anschaulich wie "Tier vs. Fahrzeug", aber das Prinzip ist gleich.

Ein Satz wie "Passwort vergessen" wird zu einer Liste von 384 Zahlen:

```
[0.12, -0.87, 0.34, 0.05, -0.22, 0.91, ...]
  ↑      ↑     ↑
 Dim1  Dim2  Dim3  ... bis Dim384
```

Das nennt man **Embedding** — eine komprimierte numerische Darstellung der Bedeutung.

---

## Ähnlichkeit = Abstand zwischen Punkten

Zwei Embeddings zu vergleichen ist dann einfach Geometrie. Wenn zwei Vektoren in die gleiche Richtung zeigen, sind sie ähnlich. Das nennt sich **Kosinus-Ähnlichkeit**:

```
"Passwort vergessen"       →  [0.12,  0.87,  0.34, ...]
"Wie setze ich Passwort       [0.14,  0.85,  0.31, ...]
 zurück?"
→ fast identische Richtung → Score: 0.95 (sehr ähnlich)


"Passwort vergessen"       →  [ 0.12,  0.87,  0.34, ...]
"Wie ist das Wetter?"      →  [-0.43,  0.12, -0.67, ...]
→ entgegengesetzte Richtung → Score: 0.11 (nicht ähnlich)
```

---

## Woher weiß das Modell, welche Wörter ähnlich sind?

Das Modell wurde auf riesigen Textmengen trainiert. Es hat dabei gelernt: Wörter, die oft im gleichen Kontext vorkommen, bekommen ähnliche Vektoren.

Beispiel aus dem Training:
- "Ich habe mein **Passwort** vergessen" und "Ich kann mich nicht **einloggen**" tauchen in ähnlichen Texten auf
- → Das Modell platziert "Passwort vergessen" und "einloggen" nah beieinander im Vektorraum

Das ist der Kern von "semantisch" — nicht nach dem Wort suchen, sondern nach der **Bedeutung**.

---

## Zusammengefasst

| Schritt | Was passiert |
|---|---|
| Training | Modell lernt aus Milliarden Sätzen, welche Bedeutungen zusammengehören |
| Indexierung | Jedes FAQ wird in 384 Zahlen umgerechnet und gespeichert |
| Suche | Query wird auch in 384 Zahlen umgerechnet |
| Vergleich | Abstand zwischen Query-Vektor und FAQ-Vektoren → Score |

---

## Warum Bi-Encoder vs. Cross-Encoder?

Ein **Bi-Encoder** (wie das E5-Modell hier) berechnet Vektoren für Query und Dokument **getrennt** und vergleicht sie nachträglich. Das ist schnell, weil Dokument-Vektoren vorab gespeichert werden können.

Ein **Cross-Encoder** verarbeitet Query und Dokument **zusammen** — er kann jeden Begriff im Query gegen jeden Begriff im Dokument abwägen. Das liefert präzisere Scores, ist aber langsamer, weil nichts vorab berechnet werden kann.

Mehr dazu in [OPTIMIZATION-OPTIONS.md](../OPTIMIZATION-OPTIONS.md).
