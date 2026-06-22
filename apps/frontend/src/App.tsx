import { useEffect, useState } from 'react';
import { getAllFaqs, searchFaqs, Faq, SearchResult } from './api/faq';
import { SearchBar } from './components/SearchBar';
import { FaqList } from './components/FaqList';

export default function App() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    getAllFaqs()
      .then(setFaqs)
      .catch(() => setError('FAQs konnten nicht geladen werden. Ist das Backend erreichbar?'))
      .finally(() => setInitialLoading(false));
  }, []);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setLastQuery(query);
    try {
      const res = await searchFaqs(query);
      setResults(res);
    } catch {
      setError('Suche fehlgeschlagen. Bitte versuche es erneut.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults(null);
    setLastQuery('');
    setError(null);
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Häufig gestellte Fragen</h1>
        <p>Durchsuche unsere FAQs – semantische Suche findet auch ähnliche Formulierungen</p>
      </div>

      <SearchBar onSearch={handleSearch} loading={loading} />

      {error && <div className="error-msg">{error}</div>}

      {results !== null && (
        <div className="status-bar">
          <span className="status-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="badge">{results.length} Treffer</span> für „{lastQuery}"
          </span>
          <button className="clear-btn" onClick={handleClear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Suche zurücksetzen
          </button>
        </div>
      )}

      {initialLoading ? (
        <div className="loading-msg">Lade FAQs…</div>
      ) : (
        <FaqList faqs={faqs} results={results} />
      )}
    </div>
  );
}
