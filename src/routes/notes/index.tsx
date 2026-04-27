import { createFileRoute, Link } from "@tanstack/react-router";
import { loadNotes, buildGraph } from "#/lib/notes";
import { BackButton } from "#/components/BackButton";
import { Search } from "#/components/notes/Search";
import { NotesTabs } from "#/components/notes/NotesTabs";
import { GraphModal } from "#/components/notes/GraphModal";
import { useState, useMemo } from "react";
import GraphIcon from "~icons/ph/graph";
import type { Note } from "#/types/notes";
import sites from "#/data/sites";

export const Route = createFileRoute("/notes/")({
  component: NotesPage,
  loader: async () => {
    const [notes, graph] = await Promise.all([loadNotes(), buildGraph()]);
    return { notes, graph };
  },
  head: () => ({ meta: [{ title: `Notes | ${sites.siteName}` }] }),
  notFoundComponent: NotesNotFoundPage,
});

function NotesNotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1080px] items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl border border-pink-200 bg-white/80 p-6 shadow-soft backdrop-blur-sm md:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-pink-400">404 / notes</p>
        <h1 className="mt-3 text-3xl font-display text-pink-800 md:text-5xl">
          This note faded out of the vault.
        </h1>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-pink-950/75 md:text-base">
          The note you asked for is missing or private. Try another path back into the garden.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100"
          >
            Home
          </Link>
          <Link
            to="/notes"
            className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100"
          >
            Notes index
          </Link>
        </div>
      </div>
    </div>
  );
}

function NotesPage() {
  const { notes, graph } = Route.useLoaderData();
  const [, setSearchQuery] = useState("");
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

  const hasGraphData = graph.links.length > 0 || graph.nodes.some((n) => n.val > 1);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <BackButton />
      <div className="mb-4 pt-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-pink-950 tracking-wide">
          Personal Notes Vault
        </h1>
        <p className="text-pink-950/70 mt-2 font-body">
          A collection of notes, articles, and thoughts. These are pulled from my personal obsidian
          vault.
          <br />
          There are <span className="text-pink-500">{notes.length}</span> public notes.
        </p>
      </div>
      {notes.length > 0 && (
        <div className="mb-4">
          <Search notes={notes} onSearch={handleSearch} />
        </div>
      )}
      {notes.length === 0 ? (
        <div className="text-center py-20 text-pink-950/50">
          <p>No public notes yet.</p>
          <p className="text-sm mt-2">
            <code>public</code> tag to publish them.
          </p>
        </div>
      ) : (
        <NotesTabs notes={displayedNotes} />
      )}
      {hasGraphData && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setGraphOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-pink-200 text-sm font-body text-pink-950 hover:bg-white hover:shadow-card transition-all"
          >
            <GraphIcon className="w-4 h-4" />
            View Graph
          </button>
        </div>
      )}
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
