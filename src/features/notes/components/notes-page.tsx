import { useState, useMemo } from "react";
import { useLoaderData } from "@tanstack/react-router";
import { BackButton } from "~/components/back-button";
import { Search } from "./search";
import { NotesTabs } from "./notes-tabs";
import { GraphModal } from "./graph-modal";
import { NotFound } from "~/components/not-found";
import type { Note, NotesGraph } from "../lib/types";
import GraphIcon from "~icons/ph/graph";

export function NotesPage() {
  const data = useLoaderData({ from: "/notes/" }) as { notes: Note[]; graph: NotesGraph } | null;

  const [, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  const [graphOpen, setGraphOpen] = useState(false);

  const displayedNotes = useMemo(() => {
    if (searchResults !== null) return searchResults;
    return data?.notes ?? [];
  }, [data?.notes, searchResults]);

  if (!data) {
    return (
      <NotFound
        path="notes"
        label="Digital Garden"
        title="This note faded out of the vault."
        description="The note you asked for is missing or private. Try another path back into the garden."
        backTo={{ to: "/notes/", label: "Notes index" }}
      />
    );
  }

  const { notes, graph } = data;

  const handleSearch = (query: string, results: Note[] | null) => {
    setSearchQuery(query);
    setSearchResults(results);
  };

  const hasGraphData = graph.links.length > 0 || graph.nodes.some((n) => n.val > 1);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <BackButton />
      <div className="mb-4 pt-6">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-pink-950 tracking-wide">
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
            <GraphIcon className="size-4" />
            View Graph
          </button>
        </div>
      )}
      <GraphModal
        graph={graph}
        isOpen={graphOpen}
        onClose={() => setGraphOpen(false)}
        onNodeClick={() => {}}
      />
    </div>
  );
}
