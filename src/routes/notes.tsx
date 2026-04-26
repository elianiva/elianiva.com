import { createFileRoute } from "@tanstack/react-router";
import { loadNotes, buildGraph } from "#/lib/notes";
import { BackButton } from "#/components/BackButton";
import { Search } from "#/components/notes/Search";
import { NotesTabs } from "#/components/notes/NotesTabs";
import { GraphModal } from "#/components/notes/GraphModal";
import { useState, useMemo } from "react";
import GraphIcon from "~icons/ph/graph";
import type { Note } from "#/types/notes";

export const Route = createFileRoute("/notes")({
  component: NotesPage,
  loader: async () => {
    const [notes, graph] = await Promise.all([
      loadNotes(),
      buildGraph(),
    ]);
    return { notes, graph };
  },
  head: () => ({
    meta: [{ title: "Notes | elianiva's home row" }],
  }),
});

function NotesPage() {
  const { notes, graph } = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  const [graphOpen, setGraphOpen] = useState(false);

  const displayedNotes = useMemo(() => {
    if (searchResults !== null) return searchResults;
    return notes;
  }, [notes, searchResults]);

  const handleSearch = (query: string, results: Note[]) => {
    setSearchQuery(query);
    setSearchResults(query ? results : null);
  };

  return (
    <div className="mx-auto max-w-[1080px] pt-20 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <BackButton />

        <div className="flex items-center justify-between pt-6 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold font-display text-pink-950 tracking-wide">
            Notes Vault
          </h1>
          <button
            onClick={() => setGraphOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/60 border border-pink-200 text-sm font-body text-pink-950 hover:bg-white hover:shadow-card transition-all"
          >
            <GraphIcon className="w-4 h-4" />
            Graph
          </button>
        </div>

        <p className="text-sm md:text-base font-body text-pink-950/70 pb-6">
          A collection of my notes, articles, bookmarks, and other things I find
          interesting. Mostly written in Obsidian-style markdown.
        </p>

        <div className="mb-6">
          <Search notes={notes} onSearch={handleSearch} />
        </div>

        {searchQuery && (
          <p className="text-sm text-pink-950/50 mb-4 font-body">
            {displayedNotes.length} result{displayedNotes.length !== 1 ? "s" : ""} for "{searchQuery}"
          </p>
        )}

        <NotesTabs notes={displayedNotes} />
      </div>

      <GraphModal
        graph={graph}
        isOpen={graphOpen}
        onClose={() => setGraphOpen(false)}
        onNodeClick={(slug) => {
          window.location.href = `/notes/${slug}`;
        }}
      />
    </div>
  );
}
