import { Client } from '@elastic/elasticsearch';
import { faqs } from '../data/faqs';
import { INDEX_NAME, faqMapping } from '../elastic/mapping';

const ES_URL = process.env.ES_URL || 'http://localhost:9200';

function stripHtml(html: string): string {
  return html
    // block elements → Leerzeichen, damit Wortgrenzen erhalten bleiben
    .replace(/<\/?(?:p|ul|ol|li)\b[^>]*>/gi, ' ')
    // inline elements → nur Tags entfernen, Inhalt behalten
    .replace(/<\/?(?:strong|span|a|em)\b[^>]*>/gi, '')
    // HTML-Entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Whitespace normalisieren
    .replace(/\s+/g, ' ')
    .trim();
}

async function main(): Promise<void> {
  const client = new Client({ node: ES_URL });

  console.log(`Connecting to Elasticsearch at ${ES_URL}...`);

  const exists = await client.indices.exists({ index: INDEX_NAME });
  if (exists) {
    console.log(`Index "${INDEX_NAME}" exists – deleting...`);
    await client.indices.delete({ index: INDEX_NAME });
    console.log('Deleted.');
  }

  console.log(`Creating index "${INDEX_NAME}" with semantic_text mapping...`);
  await client.indices.create({
    index: INDEX_NAME,
    mappings: { properties: faqMapping },
  });
  console.log('Index created.');

  let indexed = 0;
  for (const faq of faqs) {
    console.log(`[${indexed + 1}/${faqs.length}] Indexing: ${faq.questions[0]}`);

    await client.index({
      index: INDEX_NAME,
      id: faq.id,
      document: {
        id: faq.id,
        question: faq.questions,
        answer: stripHtml(faq.answer),
        answerHtml: faq.answer,
      },
    });

    indexed++;
    console.log(`  ✓ Indexed ${faq.id}`);
  }

  await client.indices.refresh({ index: INDEX_NAME });

  console.log(`\nDone. Indexed ${indexed}/${faqs.length} documents into "${INDEX_NAME}".`);
  console.log('Note: ES generates embeddings asynchronously – allow a few seconds before searching.');
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
