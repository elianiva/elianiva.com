import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import type { Note, NoteCategory } from "../lib/types";

interface NotesTabsProps {
  notes: Note[];
}

const categoryLabels: Record<string, string> = {
  articles: "Articles",
  vault: "Vault",
  people: "People",
  music: "Music",
};

const categoryOrder: NoteCategory[] = ["vault", "articles", "people", "music"];

export function NotesTabs({ notes }: NotesTabsProps) {
  const [activeTab, setActiveTab] = useState<NoteCategory | "all">("all");

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notes.length };
    for (const cat of categoryOrder) {
      counts[cat] = notes.filter((n) => n.category === cat).length;
    }
    return counts;
  }, [notes]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return notes;
    return notes.filter((n) => n.category === activeTab);
  }, [notes, activeTab]);

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b border-pink-200/50" role="tablist">
        {(["all", ...categoryOrder] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-body transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2 ${
              activeTab === tab
                ? "text-pink-900 border-b-2 border-pink-500"
                : "text-pink-950/50 hover:text-pink-950/70"
            }`}
          >
            {tab === "all" ? "All" : categoryLabels[tab] || tab}
            <span className="ml-1.5 text-xs opacity-60">({tabCounts[tab]})</span>
          </button>
        ))}
      </div>

      <div className="space-y-2" role="tabpanel">
        {filtered.map((note) => (
          <Link
            key={note.slug}
            to={`/notes/${note.slug}`}
            className="group flex items-center gap-3 p-3 bg-white/60 hover:bg-white border border-pink-200/50 transition-all"
            style={{ viewTransitionName: `note-card-${note.slug}` }}
          >
            <div className="flex-1 min-w-0">
              <span className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors text-sm">
                {note.title}
              </span>
              {note.description && (
                <p className="text-xs text-pink-950/60 mt-0.5 line-clamp-1">
                  {note.description}
                </p>
              )}
            </div>
            <span className="text-xs font-mono text-pink-950/40 uppercase shrink-0">
              {categoryLabels[note.category] || note.category}
            </span>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm font-body text-pink-950/50 py-8">
            No notes in this category.
          </p>
        )}
      </div>
    </div>
  );
}
