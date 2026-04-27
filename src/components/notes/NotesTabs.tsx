import { useState, useMemo, useEffect } from "react";
import type { Note, NoteCategory } from "~/types/notes";
import { ArticleCard } from "./ArticleCard";
import { VaultCard } from "./VaultCard";
import { MusicCard } from "./MusicCard";
import { PeopleCard } from "./PeopleCard";

interface NotesTabsProps {
  notes: Note[];
}

const categories: NoteCategory[] = ["articles", "vault", "people", "music"];

const categoryLabels: Record<NoteCategory, string> = {
  articles: "Articles",
  vault: "Vault",
  people: "People",
  music: "Music",
};

const categoryHashMap: Record<string, NoteCategory> = {
  articles: "articles",
  vault: "vault",
  people: "people",
  music: "music",
};

const hashToCategoryMap: Record<NoteCategory, string> = {
  articles: "articles",
  vault: "vault",
  people: "people",
  music: "music",
};

export function NotesTabs({ notes }: NotesTabsProps) {
  const [activeTab, setActiveTab] = useState<NoteCategory>("articles");

  // Read hash from URL on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && categoryHashMap[hash]) {
      setActiveTab(categoryHashMap[hash]);
    }
  }, []);

  const displayedNotes = useMemo(
    () => notes.filter((n) => n.category === activeTab),
    [notes, activeTab],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<NoteCategory, number> = {
      articles: 0,
      vault: 0,
      people: 0,
      music: 0,
    };
    for (const note of notes) {
      if (counts[note.category] !== undefined) {
        counts[note.category]++;
      }
    }
    return counts;
  }, [notes]);

  function setTab(category: NoteCategory) {
    setActiveTab(category);
    const hash = hashToCategoryMap[category];
    window.history.replaceState(null, "", `#${hash}`);
  }

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="relative flex flex-wrap gap-4 border-b border-pink-300/50 pb-2">
        {/* floating indicator */}
        <span className="tab-indicator" />
        {categories.map((cat) => {
          const count = categoryCounts[cat];
          const isActive = activeTab === cat;
          return (
            <button
              key={cat}
              onClick={() => setTab(cat)}
              className={`tab-btn relative flex items-center gap-2 text-sm font-medium transition-colors pb-1 cursor-pointer outline-none focus-visible:ring focus-visible:ring-pink-400/40 px-2 py-1 ${
                isActive ? "text-pink-600" : "text-pink-950/50 hover:text-pink-950/80"
              }`}
              aria-pressed={isActive}
              style={isActive ? ({ anchorName: "--active-tab" } as React.CSSProperties) : undefined}
            >
              {categoryLabels[cat]}
              <span
                className={`text-xs px-1.5 py-0.5 ${
                  isActive ? "bg-pink-100 text-pink-600" : "bg-pink-50 text-pink-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notes grid */}
      {displayedNotes.length === 0 ? (
        <div className="text-center py-12 text-pink-950/50">
          <p>No notes found in this category.</p>
        </div>
      ) : activeTab === "articles" ? (
        <div className="grid gap-2">
          {displayedNotes.map((note) => (
            <ArticleCard key={note.slug} note={note} />
          ))}
        </div>
      ) : activeTab === "vault" ? (
        <div className="grid gap-2">
          {displayedNotes.map((note) => (
            <VaultCard key={note.slug} note={note} />
          ))}
        </div>
      ) : activeTab === "music" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {displayedNotes.map((note) => (
            <MusicCard key={note.slug} note={note} />
          ))}
        </div>
      ) : activeTab === "people" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {displayedNotes.map((note) => (
            <PeopleCard key={note.slug} note={note} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
