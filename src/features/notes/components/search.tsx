import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import type { Note } from "../lib/types";

interface SearchProps {
  notes: Note[];
  onSearch: (query: string, results: Note[]) => void;
}

function searchNotes(notes: Note[], query: string): Note[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.tags.some((t) => t.toLowerCase().includes(q)) ||
        note.description.toLowerCase().includes(q),
    )
    .slice(0, 10);
}

export function Search({ notes, onSearch }: SearchProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchNotes(notes, query), [notes, query]);

  const updateSearchQuery = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);
      setActiveIndex(-1);
      onSearch(newQuery, searchNotes(notes, newQuery));
    },
    [notes, onSearch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Escape") {
        setQuery("");
        inputRef.current?.blur();
      }
    },
    [results.length],
  );

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={updateSearchQuery}
        onKeyDown={handleKeyDown}
        placeholder="Search notes..."
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls="search-results-listbox"
        aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
        className="w-full bg-white/60 border border-pink-200 px-4 py-2 text-sm font-body text-pink-950 placeholder:text-pink-950/40 focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
      />
      {results.length > 0 && (
        <ul
          ref={listboxRef}
          id="search-results-listbox"
          role="listbox"
          className="absolute z-10 w-full bg-white border border-pink-200 shadow-card mt-1 max-h-80 overflow-y-auto"
        >
          {results.map((note, i) => (
            <li
              key={note.slug}
              id={`search-result-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`border-b border-pink-100 last:border-b-0 ${
                i === activeIndex ? "bg-pink-100" : ""
              }`}
            >
              <Link
                to={`/notes/${note.slug}`}
                className="block px-4 py-3 text-sm font-body text-pink-950 hover:bg-pink-50 focus:outline-none focus:ring focus:ring-pink-400 focus:ring-inset"
              >
                <span className="font-medium">{note.title}</span>
                {note.description && (
                  <span className="block text-xs text-pink-950/60 mt-0.5 line-clamp-1">
                    {note.description}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
