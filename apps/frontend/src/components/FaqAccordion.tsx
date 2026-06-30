import { useState } from 'react';

interface Props {
  questions: string[];
  answer: string;
  isMatch?: boolean;
  score?: number;
  highlight?: { questions?: string[]; answer?: string[] };
  defaultOpen?: boolean;
}

export function FaqAccordion({ questions, answer, isMatch, score, highlight, defaultOpen }: Props) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  const canonicalQuestion = questions[0];
  const displayAnswer = highlight?.answer?.[0] ?? null;

  const isTopResult = isMatch && score !== undefined && score >= 1.82;

  return (
    <div className={`accordion ${isMatch ? 'match' : 'no-match'}`}>
      <div className="acc-header" onClick={() => setOpen((o) => !o)} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}>
        <svg
          className={`acc-chevron ${open ? 'open' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          width="18" height="18"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span
          className="acc-question"
          dangerouslySetInnerHTML={{ __html: canonicalQuestion }}
        />
        {isMatch && score !== undefined && (
          <div className="acc-meta">
            <span className="badge-score">Score {score.toFixed(2)}</span>
            {isTopResult && <span className="badge-top">Top-Treffer</span>}
          </div>
        )}
      </div>
      {open && (
        <div className="acc-body open">
          <div dangerouslySetInnerHTML={{ __html: displayAnswer ?? answer }} />
        </div>
      )}
    </div>
  );
}
