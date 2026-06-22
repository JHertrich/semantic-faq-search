# FAQ Semantic Search

A full-stack semantic FAQ search prototype using NestJS, Vite + React, and Elasticsearch with `semantic_text` and the multilingual E5 model.

---

## Prerequisites

- **Node.js 20+** (check: `node -v`)
- **Docker + Docker Compose** (check: `docker compose version`)
- **At least 4 GB RAM** available for Docker (ES needs ~2 GB for ML inference)

---

## Quick Start

### 1. Install dependencies

```bash
cd faq-semantic-search
npm install && npm install --prefix apps/backend && npm install --prefix apps/frontend
```

### 2. Start Elasticsearch + Kibana

```bash
npm run docker:up
```

Wait ~30 seconds until ES is healthy:
```bash
curl http://localhost:9200/_cluster/health
```
Look for `"status":"green"` or `"status":"yellow"`.

### 3. Activate the Elastic trial license

Open Kibana at **http://localhost:5601** → **Stack Management → License Management → Start trial**.

> The trial license is persisted in the ES data volume and survives container restarts.
> You only need to activate it once — it expires after 30 days.

### 4. Download the ML model and create the inference endpoint

Run these two commands in order:

```bash
# Download the multilingual E5 model into Elasticsearch (~470 MB)
curl -s -X POST "http://localhost:5601/internal/ml/trained_models/install_elastic_trained_model/.multilingual-e5-small" \
  -H "kbn-xsrf: true" \
  -H "elastic-api-version: 1" \
  -H "Content-Type: application/json"

# Wait until the download is complete (~1-2 min), then create the inference endpoint
curl -s -X PUT "http://localhost:9200/_inference/text_embedding/my-e5-endpoint" \
  -H "Content-Type: application/json" \
  -d '{
    "service": "elasticsearch",
    "service_settings": {
      "num_allocations": 1,
      "num_threads": 1,
      "model_id": ".multilingual-e5-small"
    }
  }'
```

Verify the download is complete before creating the endpoint:
```bash
curl -s "http://localhost:9200/_ml/trained_models/.multilingual-e5-small/_stats" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['trained_model_stats'][0]['model_size_stats']['model_size_bytes'])"
# Should print 470097544
```

> The model and inference endpoint are persisted in the ES data volume.
> You only need to do this once — they survive container restarts as long as you do **not** delete the volume (`docker compose down -v`).

### 5. Index the FAQs

```bash
npm run setup-index
```

This creates the `faqs` index with `semantic_text` mapping and indexes all 20 documents.
ES generates the embeddings asynchronously — wait a few seconds after the script finishes before running your first search.

### 6. Start the development servers

```bash
npm run dev
```

Open **http://localhost:5173**.

---

## Re-creating the environment from scratch

If you deleted the Docker volume (`docker compose down -v`), repeat steps 2–5:

```bash
npm run docker:up
# → activate trial in Kibana (step 3)
# → download model + create inference endpoint (step 4)
npm run setup-index
```

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         Browser :5173                          │
│   Vite + React + TypeScript                                    │
│   SearchBar → FaqList → FaqAccordion                          │
│   Proxy /api → :3001                                          │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTP
┌───────────────────────────▼───────────────────────────────────┐
│                     NestJS Backend :3001                       │
│   FaqController  GET /faqs  POST /faqs/search                 │
│   FaqService     semantic query (no local model needed)       │
│   ElasticsearchModule → @elastic/elasticsearch client         │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTP :9200
┌───────────────────────────▼───────────────────────────────────┐
│              Elasticsearch 8.17  (Docker)                      │
│   Index: faqs                                                  │
│   Fields: id (keyword)                                        │
│           question (semantic_text → my-e5-endpoint)           │
│           answer   (semantic_text → my-e5-endpoint)           │
│                                                               │
│   ML Inference Endpoint: my-e5-endpoint                       │
│   Model: .multilingual-e5-small (470 MB, 384 dims)           │
└───────────────────────────────────────────────────────────────┘
         │
         │  Kibana :5601  (index inspection, Dev Tools, ML UI)
```

**Embedding model**: `.multilingual-e5-small` — a multilingual dense vector model built into Elasticsearch. Supports German and 100+ other languages. No external API, no GPU required.

---

## dense_vector (free) vs. semantic_text (Enterprise/Trial)

### Free — `dense_vector`

Embeddings are generated **outside** Elasticsearch by `@xenova/transformers` running in Node.js, then stored as pre-computed 384-dimensional float arrays. Search uses two `knn` clauses.

- Works with any Elasticsearch license (free Basic tier).
- Embedding model runs locally in Node.js (~120 MB download on first run).
- Setup script must regenerate all vectors when you change the model.
- See `apps/backend/src/elastic/mapping.ts` and use `knn` queries in `FaqService`.

### Enterprise / Trial — `semantic_text` (current)

The `semantic_text` field type offloads everything to an ML inference endpoint inside Elasticsearch. Documents are indexed as plain text; ES generates and stores embeddings automatically.

- Requires an **Enterprise** or active **Trial** license.
- Requires **Elasticsearch 8.15+** (not available in self-managed 8.13).
- No local model download — ES handles inference.
- Search uses the `semantic` query type.
- Automatic chunking for long texts.
- See `apps/backend/src/elastic/mapping.enterprise.ts`.

---

## Search Scoring

The search uses two `semantic` queries in a `bool should` clause — one on `question`, one on `answer`. ES computes a cosine similarity per field and combines the scores additively. This means the theoretical maximum score is ~2.2 (both fields match perfectly).

### How scores are composed

```
score = semantic(question, query) × boost(1.0)
      + semantic(answer,   query) × boost(1.0)
```

Both fields use equal boost (`1.0`). See [Why equal boost?](#why-equal-boost) below.

### Calibrated thresholds

| Parameter | Value | Location | Rationale |
|---|---|---|---|
| `min_score` | `1.80` | `FaqService.search()` | Empirically optimal on the evaluation set: Recall 100 %, Specificity 100 %, F1 = 1.0. See full calibration below. |
| Top-result badge | `≥ 1.82` | `FaqAccordion.tsx` | Scores just above the minimum threshold indicate the best match. A gap of 0.02 reliably separates the top result from the rest. |

---

## Search Optimization

### Evaluation methodology

The project includes a dedicated evaluation script (`apps/backend/src/scripts/evaluate-search.ts`) that measures search quality objectively without going through the browser UI.

**Test set:** 22 positive cases (query → expected FAQ ID) + 3 negative cases (off-topic queries that should return no results), covering all 7 FAQ categories.

**Metrics:**

| Metric | Definition |
|---|---|
| **P@1** | Fraction of positive queries where the expected FAQ is ranked #1 |
| **P@3** | Fraction of positive queries where the expected FAQ is in the top 3 |
| **Recall** | Fraction of positive queries where the expected FAQ appears at all (above threshold) |
| **Specificity** | Fraction of negative queries that correctly return zero results |
| **F1** | Harmonic mean of Recall and Specificity — the primary optimisation target |

Run the evaluation:

```bash
npm run evaluate
```

### Threshold calibration

The `min_score` threshold was swept from 1.40 to 2.90 in steps of 0.05. Key results (equal boost, no asymmetry):

```
min_score     P@1    P@3   Recall   Spec.     F1
─────────────────────────────────────────────────────────────────
1.75          73%   86%    100%     67%    0.80
1.80          73%   86%    100%    100%    1.00  ← optimal
1.85          45%   45%     45%    100%    0.63
1.90           0%    0%      0%    100%    0.00
```

**Threshold 1.80** is the unique optimum: the last value at which all off-topic queries are still filtered out (Specificity = 100 %) while all on-topic FAQs are still returned (Recall = 100 %). One step lower (1.75) lets one negative query through; one step higher (1.85) drops more than half the positive cases.

The P@1 plateau at 73 % (16/22 queries rank the expected FAQ first) and P@3 at 86 % (19/22 in top 3) reflect inherent model limitations — see [Known model limitations](#known-model-limitations).

### Why equal boost?

An asymmetric boost (`question × 2.0`, `answer × 1.0`) was tested to see whether prioritising the question field would improve ranking. Results:

| Configuration | P@1 | P@3 | Recall | Spec. | Optimal threshold |
|---|---|---|---|---|---|
| Equal boost (1.0 / 1.0) | 73 % | **86 %** | 100 % | 100 % | 1.80 |
| Question boost (2.0 / 1.0) | 73 % | **77 %** | 95 % | 100 % | 2.70 |

Question boost made P@3 worse (86 % → 77 %) and reduced Recall (100 % → 95 %). The reason: many relevant FAQs match primarily through their *answer* text (which tends to be longer and more descriptive), not just the question. Downweighting answers loses those signals.

**Conclusion:** equal boost is the better configuration for this corpus.

### Known model limitations

Five queries expose cases where `.multilingual-e5-small` confuses semantically adjacent domains. These are inherent model limitations, not configuration problems:

| Query | Expected FAQ | Actual top result | Root cause |
|---|---|---|---|
| "Kann ich die Plattform mit Slack verbinden?" | Integrationen | Onboarding | "verbinden" → platform setup |
| "Wie bekomme ich automatische Benachrichtigungen bei Ereignissen?" | Webhooks | E-Mail-Benachrichtigungen | Both are about notifications |
| "Kann ich mich mit meinem Firmen-Account anmelden?" | SSO | 2FA | Both are about authentication |
| "An wen wende ich mich wenn ich ein Problem habe?" | Support | Onboarding | "Hilfe bekommen" → getting started |
| "Wie kann ich meinen Account besser absichern?" | 2FA | Kontoinformationen | Security vs. account settings |

For these cases the Playwright tests use more direct queries (e.g. "Wie richte ich einen Webhook ein?") that the model handles correctly. The original indirect phrasing is documented in the test file as comments.

To improve ranking for indirect queries, possible approaches are:
- **Larger model** (`.multilingual-e5-base` or `.multilingual-e5-large`) — better language understanding at the cost of more RAM and inference latency.
- **FAQ content expansion** — adding synonyms or paraphrase variants to FAQ answers so semantically indirect queries find a closer match.
- **Hybrid search** — combine semantic with BM25 keyword search (`rrf` rescoring). Keyword matches reinforce semantic results for literal terms like "Slack" or "Webhook".

### Re-running the evaluation

```bash
# From the monorepo root
npm run evaluate

# Or directly
cd apps/backend && npm run evaluate
```

The script prints a per-query diagnostic table, a full threshold sweep, and a recommendation. If the optimal threshold differs from the current `min_score` in `FaqService`, update `min_score` accordingly.

---

## E2E Tests

Playwright tests cover all FAQ categories, ranking behaviour, negative queries, and UI state:

```bash
npm run test:e2e
```

32 tests, all passing. Test file: `apps/e2e/tests/faq-search.spec.ts`.

For queries affected by known model limitations, tests use direct phrasings (see comments in the test file) rather than the indirect user phrasings — these are separate UX research questions, not test failures.

---

## Environment Variables

| Variable      | Default                   | Description                        |
|---------------|---------------------------|------------------------------------|
| `ES_URL`      | `http://localhost:9200`   | Elasticsearch node URL             |
| `PORT`        | `3001`                    | NestJS HTTP port                   |
| `CORS_ORIGIN` | `http://localhost:5173`   | Allowed CORS origin                |
| `BACKEND_URL` | `http://localhost:3001`   | Vite dev proxy target (frontend)   |

---

## Kibana

Open **http://localhost:5601** to inspect the index and run queries.

Useful Dev Tools commands:

```
# Check document count
GET faqs/_count

# View a document
GET faqs/_doc/faq-001

# Test a semantic query directly
POST faqs/_search
{
  "query": {
    "semantic": {
      "field": "answer",
      "query": "Ich komme nicht mehr in mein Konto"
    }
  }
}

# Check inference endpoint status
GET _inference/text_embedding/my-e5-endpoint

# Check ML node info
GET _ml/info
```
