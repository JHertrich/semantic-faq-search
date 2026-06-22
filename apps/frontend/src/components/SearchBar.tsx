import { KeyboardEvent, useRef } from 'react';

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

export function SearchBar({ onSearch, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const q = inputRef.current?.value.trim() ?? '';
    if (q) onSearch(q);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="search-bar">
      <div className="search-wrap">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder='z.B. „Wie kann ich mein Passwort zurücksetzen?"'
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
      </div>
      <button className="search-btn" onClick={handleSearch} disabled={loading}>
        {loading ? (
          <span className="spinner" aria-label="Laden" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M12 3l1.88 5.76a2 2 0 0 0 1.36 1.36L21 12l-5.76 1.88a2 2 0 0 0-1.36 1.36L12 21l-1.88-5.76a2 2 0 0 0-1.36-1.36L3 12l5.76-1.88a2 2 0 0 0 1.36-1.36L12 3z" />
          </svg>
        )}
        Suchen
      </button>
    </div>
  );
}
