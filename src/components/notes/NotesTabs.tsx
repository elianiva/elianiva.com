import { useState, useMemo } from "react";
import type { Note, NoteCategory } from "#/types/notes";
import { ArticleCard } from "./ArticleCard";
import { VaultCard } from "./VaultCard";
import { MusicCard } from "./MusicCard";
import { PeopleCard } from "./PeopleCard";

interface NotesTabsProps {
  notes: Note[];
}

const TABS: { id: NoteCategory; label: string }[] = [
  { id: "articles", label: "Articles" },
  { id: "vault", label: "Vault" },
  { id: "people", label: "People" },
  { id: "music", label: "Music" },
];

export function NotesTabs({ notes }: NotesTabsProps) {
  const [activeTab, setActiveTab] = useState<NoteCategory>("articles");

  const filteredNotes = useMemo(
    () => notes.filter((n) => n.category === activeTab),
    [notes, activeTab],
  );

  const counts = useMemo(() => {
    const c: Record<NoteCategory, number> = { articles: 0, vault: 0, people: 0, music: 0 };
    for (const note of notes) {
      c[note.category]++;
    }
    return c;
  }, [notes]);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-pink-200/50 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 text-sm font-body transition-colors ${
              activeTab === tab.id
                ? "text-pink-950 font-semibold"
                : "text-pink-950/50 hover:text-pink-950/70"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs font-mono text-pink-950/30">
              {counts[tab.id]}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-400" />
            )}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => {
          switch (activeTab) {
            case "articles":
              return <ArticleCard key={note.slug} note={note} />;
            case "vault":
              return <VaultCard key={note.slug} note={note} />;
            case "music":
              return <MusicCard key={note.slug} note={note} />;
            case "people":
              return <PeopleCard key={note.slug} note={note} />;
            default:
              return null;
          }
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12 text-pink-950/40 font-body">
          No notes in this category.
        </div>
      )}
    </div>
  );
}
