import { Client } from '@elastic/elasticsearch';

const ES_URL = process.env.ES_URL || 'http://localhost:9200';
const INDEX_NAME = 'faqs';

interface TestCase {
  query: string;
  expectedFaqId: string;
  description: string;
  isNegative?: boolean;
}

const TEST_CASES: TestCase[] = [
  // Account & Sicherheit
  { query: 'Passwort vergessen',                                         expectedFaqId: 'faq-001', description: 'Passwort (literal)' },
  { query: 'Ich kann mich nicht mehr in meinen Account einloggen',       expectedFaqId: 'faq-001', description: 'Login fehlgeschlagen (semantisch)' },
  { query: 'Wie kann ich meinen Account besser absichern?',              expectedFaqId: 'faq-003', description: 'Konto absichern → 2FA' },
  { query: 'Google Authenticator einrichten',                            expectedFaqId: 'faq-003', description: 'Google Authenticator → 2FA' },
  { query: 'Wo kann ich meinen Namen und meine E-Mail-Adresse ändern?',  expectedFaqId: 'faq-020', description: 'Kontodaten ändern' },
  // Abrechnung & Preise
  { query: 'Kann ich mit Kreditkarte bezahlen?',                         expectedFaqId: 'faq-002', description: 'Kreditkarte → Zahlungsmethoden' },
  { query: 'Bekomme ich einen Rabatt wenn ich jährlich zahle?',          expectedFaqId: 'faq-016', description: 'Rabatt Jahresabo' },
  { query: 'Was ist der Unterschied zwischen Free und Pro?',             expectedFaqId: 'faq-007', description: 'Plan-Unterschiede' },
  // Daten & Datenschutz
  { query: 'Wie kann ich meine Daten herunterladen?',                    expectedFaqId: 'faq-005', description: 'Daten exportieren' },
  { query: 'Ich möchte mein Konto löschen und alle Daten entfernen',     expectedFaqId: 'faq-011', description: 'DSGVO-Löschung' },
  { query: 'Wie kann ich E-Mail-Benachrichtigungen deaktivieren?',       expectedFaqId: 'faq-012', description: 'Benachrichtigungen' },
  // Team & Zusammenarbeit
  { query: 'Wie lade ich Kollegen in meinen Workspace ein?',             expectedFaqId: 'faq-006', description: 'Teammitglieder einladen' },
  // Technik & Integrationen
  { query: 'Wie greife ich programmatisch auf die Plattform zu?',        expectedFaqId: 'faq-004', description: 'API-Schlüssel' },
  { query: 'Kann ich die Plattform mit Slack verbinden?',                expectedFaqId: 'faq-010', description: 'Slack → Integrationen' },
  { query: 'Wie bekomme ich automatische Benachrichtigungen bei Ereignissen?', expectedFaqId: 'faq-018', description: 'HTTP Callback → Webhooks' },
  { query: 'Wie groß darf eine Datei sein, die ich hochlade?',           expectedFaqId: 'faq-019', description: 'Maximale Dateigröße → Upload-Limits' },
  { query: 'Kann ich mich mit meinem Firmen-Account anmelden?',          expectedFaqId: 'faq-017', description: 'Unternehmens-Login → SSO' },
  // Support & Onboarding
  { query: 'An wen wende ich mich wenn ich ein Problem habe?',           expectedFaqId: 'faq-008', description: 'Hilfe bekommen → Support' },
  { query: 'Gibt es die Plattform auch als App für mein Smartphone?',    expectedFaqId: 'faq-009', description: 'Mobile App' },
  { query: 'Wie zuverlässig ist die Plattform? Gibt es Ausfälle?',       expectedFaqId: 'faq-013', description: 'Uptime/Verfügbarkeit' },
  { query: 'Ich bin neu hier, wie fange ich an?',                        expectedFaqId: 'faq-014', description: 'Onboarding' },
  { query: 'Ich hätte eine Idee für eine neue Funktion',                 expectedFaqId: 'faq-015', description: 'Feature-Wunsch' },
  // Negative Tests
  { query: 'Wie ist das Wetter morgen in München?',   expectedFaqId: '', description: 'Wetter (negativ)',              isNegative: true },
  { query: 'Was ist die Hauptstadt von Frankreich?',  expectedFaqId: '', description: 'Geographie (negativ)',          isNegative: true },
  { query: 'Fibonacci-Folge in Python berechnen',     expectedFaqId: '', description: 'Programmieraufgabe (negativ)', isNegative: true },
];

const POSITIVE_CASES = TEST_CASES.filter((t) => !t.isNegative);
const NEGATIVE_CASES = TEST_CASES.filter((t) => t.isNegative);

interface HitResult {
  id: string;
  score: number;
  question: string;
}

interface QueryResult {
  testCase: TestCase;
  hits: HitResult[];
}

function rankOf(hits: HitResult[], expectedId: string): number {
  const idx = hits.findIndex((h) => h.id === expectedId);
  return idx === -1 ? Infinity : idx + 1;
}

function pct(n: number, total: number) {
  return total === 0 ? '  n/a' : `${Math.round((n / total) * 100).toString().padStart(4)}%`;
}

function bar(value: number, max = 1, width = 20): string {
  const filled = Math.round((value / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

async function main() {
  const client = new Client({ node: ES_URL });

  console.log(`\n${'═'.repeat(70)}`);
  console.log(' FAQ SEMANTIC SEARCH — EVALUATION');
  console.log(`${'═'.repeat(70)}\n`);
  console.log(`Elasticsearch: ${ES_URL}   Index: ${INDEX_NAME}`);
  console.log(`Test cases: ${POSITIVE_CASES.length} positive  |  ${NEGATIVE_CASES.length} negative\n`);

  // ── 1. Collect raw scores for all queries ──────────────────────────────
  console.log('Running queries against Elasticsearch…\n');
  const allResults: QueryResult[] = await Promise.all(
    TEST_CASES.map(async (tc) => {
      const response = await client.search({
        index: INDEX_NAME,
        size: 20,
        query: {
          bool: {
            should: [
              { semantic: { field: 'question', query: tc.query } } as any,
              { semantic: { field: 'answer',   query: tc.query } } as any,
            ],
            minimum_should_match: 1,
          },
        },
      } as any);

      const hits: HitResult[] = response.hits.hits.map((h: any) => ({
        id: h._source?.id ?? h._id,
        score: h._score ?? 0,
        question: (() => {
          const q = h._source?.question;
          return typeof q === 'string' ? q : (q?.text ?? '');
        })(),
      }));

      return { testCase: tc, hits };
    }),
  );

  // ── 2. Per-query diagnostic at current threshold ────────────────────────
  const CURRENT_THRESHOLD = 1.8;
  console.log(`${'─'.repeat(70)}`);
  console.log(` PER-QUERY RESULTS  (current min_score: ${CURRENT_THRESHOLD})`);
  console.log(`${'─'.repeat(70)}`);

  for (const { testCase: tc, hits } of allResults) {
    if (tc.isNegative) continue;
    const rank = rankOf(hits, tc.expectedFaqId);
    const topHit = hits[0];
    const expectedHit = hits.find((h) => h.id === tc.expectedFaqId);
    const expectedScore = expectedHit?.score ?? 0;
    const passesThreshold = expectedScore >= CURRENT_THRESHOLD;
    const status = passesThreshold && rank <= 3 ? '✓' : '✗';
    const rankLabel = rank === Infinity ? 'not found' : `rank ${rank}`;
    console.log(
      `  ${status} [${tc.expectedFaqId}] ${tc.description.padEnd(38)} ` +
      `score: ${expectedScore.toFixed(3).padStart(6)}  ${rankLabel}`,
    );
    if (!passesThreshold || rank > 3) {
      console.log(`      Top result: "${topHit?.question.slice(0, 55)}"  score: ${topHit?.score.toFixed(3)}`);
    }
  }

  console.log(`\n  Negative queries:`);
  for (const { testCase: tc, hits } of allResults) {
    if (!tc.isNegative) continue;
    const aboveThreshold = hits.filter((h) => h.score >= CURRENT_THRESHOLD).length;
    const status = aboveThreshold === 0 ? '✓' : '✗';
    console.log(
      `  ${status} ${tc.description.padEnd(38)} results above threshold: ${aboveThreshold}` +
      (hits[0] ? `  (top score: ${hits[0].score.toFixed(3)})` : ''),
    );
  }

  // ── 3. Threshold sweep ─────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(70)}`);
  console.log(' THRESHOLD SWEEP');
  console.log(`${'─'.repeat(70)}`);
  console.log(
    `  ${'min_score'.padEnd(10)} ${'P@1'.padStart(6)} ${'P@3'.padStart(6)} ${'Recall'.padStart(8)} ${'Spec.'.padStart(7)} ${'F1'.padStart(6)}  chart`,
  );
  console.log(`  ${'─'.repeat(65)}`);

  const thresholds = Array.from({ length: 31 }, (_, i) =>
    parseFloat((1.40 + i * 0.05).toFixed(2)),
  );

  let bestF1 = 0;
  let bestThreshold = CURRENT_THRESHOLD;

  for (const threshold of thresholds) {
    let p1 = 0, p3 = 0, recall = 0, trueNeg = 0;

    for (const { testCase: tc, hits } of allResults) {
      const filteredHits = hits.filter((h) => h.score >= threshold);
      if (tc.isNegative) {
        if (filteredHits.length === 0) trueNeg++;
      } else {
        const rank = rankOf(filteredHits, tc.expectedFaqId);
        if (rank === 1) p1++;
        if (rank <= 3) p3++;
        if (rank !== Infinity) recall++;
      }
    }

    const recallRate  = recall  / POSITIVE_CASES.length;
    const specRate    = trueNeg / NEGATIVE_CASES.length;
    const f1 = recallRate + specRate > 0
      ? (2 * recallRate * specRate) / (recallRate + specRate)
      : 0;

    if (f1 > bestF1) { bestF1 = f1; bestThreshold = threshold; }

    const marker = threshold === CURRENT_THRESHOLD ? ' ← current' : (f1 === bestF1 && threshold === bestThreshold ? ' ← best' : '');
    console.log(
      `  ${threshold.toFixed(2).padEnd(10)} ` +
      `${pct(p1, POSITIVE_CASES.length)} ` +
      `${pct(p3, POSITIVE_CASES.length)} ` +
      `${pct(recall, POSITIVE_CASES.length).padStart(8)} ` +
      `${pct(trueNeg, NEGATIVE_CASES.length).padStart(7)} ` +
      `${f1.toFixed(2).padStart(6)}  ${bar(f1)}${marker}`,
    );
  }

  // ── 4. Recommendation ─────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(70)}`);
  console.log(` RECOMMENDATION`);
  console.log(`${'─'.repeat(70)}`);
  console.log(`  Optimal min_score: ${bestThreshold}  (F1: ${bestF1.toFixed(3)})`);

  if (bestThreshold !== CURRENT_THRESHOLD) {
    console.log(`  Current min_score: ${CURRENT_THRESHOLD}`);
    console.log(`\n  → Update min_score in apps/backend/src/faq/faq.service.ts`);
    console.log(`    from ${CURRENT_THRESHOLD} to ${bestThreshold}\n`);
  } else {
    console.log(`  Current setting is already optimal.\n`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Evaluation failed:', err.message);
  process.exit(1);
});
