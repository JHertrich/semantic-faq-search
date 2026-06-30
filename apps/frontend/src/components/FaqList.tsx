import { Faq, SearchResult } from '../api/faq';
import { FaqAccordion } from './FaqAccordion';

interface Props {
  faqs: Faq[];
  results: SearchResult[] | null;
}

export function FaqList({ faqs, results }: Props) {
  if (results === null) {
    return (
      <div>
        {faqs.map((faq) => (
          <FaqAccordion key={faq.id} questions={faq.questions} answer={faq.answer} />
        ))}
      </div>
    );
  }

  const matchedIds = new Set(results.map((r) => r.id));
  const unmatched = faqs.filter((f) => !matchedIds.has(f.id));

  return (
    <div>
      {results.map((result) => (
        <FaqAccordion
          key={result.id}
          questions={result.questions}
          answer={result.answer}
          isMatch
          score={result.score}
          highlight={result.highlight}
          defaultOpen
        />
      ))}

      {unmatched.length > 0 && (
        <>
          <div className="divider">Weitere FAQs (kein Treffer)</div>
          {unmatched.map((faq) => (
            <FaqAccordion key={faq.id} questions={faq.questions} answer={faq.answer} />
          ))}
        </>
      )}
    </div>
  );
}
