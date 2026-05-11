import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
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

function NoteLink({ note }: { note: Note }) {
  return (
    <Link
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
  );
}

export function NotesTabs({ notes }: NotesTabsProps) {
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notes.length };
    for (const cat of categoryOrder) {
      counts[cat] = notes.filter((n) => n.category === cat).length;
    }
    return counts;
  }, [notes]);

  const notesByCategory = useMemo(() => {
    const byCat: Record<string, typeof notes> = { all: notes };
    for (const cat of categoryOrder) {
      byCat[cat] = notes.filter((n) => n.category === cat);
    }
    return byCat;
  }, [notes]);

  return (
    <Tabs defaultValue="all" className="gap-0">
      <TabsList variant="line" className="w-full justify-start border-b border-pink-200/50 rounded-none bg-transparent gap-0">
        {(["all", ...categoryOrder] as const).map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="px-4 py-2 text-sm font-body data-active:text-pink-900 data-active:after:opacity-100 after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-pink-500 text-pink-950/50 hover:text-pink-950/70"
          >
            {tab === "all" ? "All" : categoryLabels[tab] || tab}
            <span className="ml-1.5 text-xs opacity-60">({tabCounts[tab]})</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="all" className="mt-0 space-y-2">
        {notesByCategory.all.map((note) => (
          <NoteLink key={note.slug} note={note} />
        ))}
      </TabsContent>

      {categoryOrder.map((cat) => (
        <TabsContent key={cat} value={cat} className="mt-0 space-y-2">
          {notesByCategory[cat].length > 0 ? (
            notesByCategory[cat].map((note) => (
              <NoteLink key={note.slug} note={note} />
            ))
          ) : (
            <p className="text-center text-sm font-body text-pink-950/50 py-8">
              No notes in this category.
            </p>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
