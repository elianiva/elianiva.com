import { useState, useCallback } from "react";
import type { Note } from "~/types/notes";

interface SearchProps {
  notes: Note[];
  onSearch: (query: string, results: Note[]) => void;
}

const categoryLabels: Record<string, string> = {
  article: "Article",
  vault: "Vault",
  person: "Person",
  music: "Music",
  articles: "Article",
  people: "Person",
};

function searchNotes(notes: Note[], query: string): Note[] {
  const q = query.toLowerCase().trim();
  if (!q) return notes;
  return notes.filter((note) => {
    if (note.title.toLowerCase().includes(q)) return true;
    if (note.description?.toLowerCase().includes(q)) return true;
    if (note.tags?.some((t) => t.toLowerCase().includes(q))) return true;
    return false;
  });
}

export function Search({ notes, onSearch }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Note[]>([]);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      const searchResults = searchNotes(notes, value);
      setResults(searchResults);
      onSearch(value, searchResults);
    },
    [notes, onSearch],
  );

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search notes..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 pl-11 bg-white/60 border border-pink-200 text-sm font-body text-pink-950 placeholder:text-pink-950/40 focus:outline-none focus:ring focus:ring-pink-400 focus:bg-white/80"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-950/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => handleChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-950/40 hover:text-pink-950/70"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {query && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white/90 backdrop-blur-sm border border-pink-200 shadow-lg max-h-96 overflow-auto">
          {results.map((result) => (
            <a
              key={result.slug}
              href={`/notes/${result.slug}`}
              className="block p-4 hover:bg-pink-50/50 transition-colors border-b border-pink-100 last:border-b-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-pink-950">{result.title}</h4>
                  {result.description && (
                    <p className="text-sm text-pink-950/60 mt-1 line-clamp-2">
                      {result.description}
                    </p>
                  )}
                </div>
                <span className="text-xs px-2 py-1 bg-pink-100/50 text-pink-900 shrink-0">
                  {categoryLabels[result.category] || result.category}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white/90 backdrop-blur-sm border border-dashed border-pink-200 p-4 text-center text-pink-950/50">
          No results found
        </div>
      )}
    </div>
  );
}
