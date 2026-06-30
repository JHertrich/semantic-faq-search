export interface Faq {
  id: string;
  questions: string[];
  answer: string;
}

export interface SearchResult extends Faq {
  score: number;
  highlight: {
    questions?: string[];
    answer?: string[];
  };
}

export async function getAllFaqs(): Promise<Faq[]> {
  const res = await fetch('/api/faqs');
  if (!res.ok) throw new Error(`GET /faqs failed: ${res.status}`);
  return res.json();
}

export async function searchFaqs(query: string): Promise<SearchResult[]> {
  const res = await fetch('/api/faqs/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`POST /faqs/search failed: ${res.status}`);
  return res.json();
}
