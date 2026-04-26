import { useState, useCallback, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import type { Note } from "#/types/notes";
import SearchIcon from "~icons/ph/magnifying-glass";
import XIcon from "~icons/ph/x";

interface SearchProps {
  notes: Note[];
  onSearch: (query: string, results: Note[]) => void;
}

export function Search({ notes, onSearch }: SearchProps) {
  const [query, setQuery] = useState("");
  const fuseRef = useRef<Fuse<Note> | null>(null);

  useEffect(() => {
    fuseRef.current = new Fuse(notes, {
      keys: ["title", "description", "tags", "content"],
      threshold: 0.3,
      includeScore: true,
    });
  }, [notes]);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (!value.trim()) {
        onSearch("", notes);
        return;
      }
      const results = fuseRef.current?.search(value).map((r) => r.item) ?? [];
      onSearch(value, results);
    },
    [notes, onSearch],
  );

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-950/40" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search notes..."
        className="w-full pl-9 pr-9 py-2 bg-white/60 border border-pink-200 text-sm font-body text-pink-950 placeholder:text-pink-950/40 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-1"
      />
      {query && (
        <button
          onClick={() => handleChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-950/40 hover:text-pink-950 transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
