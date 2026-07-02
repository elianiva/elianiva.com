import { useState, useMemo } from "react";
import { useLoaderData } from "@tanstack/react-router";
import { BackButton } from "~/components/back-button";
import { Search } from "./search";
import { NotesTabs } from "./notes-tabs";
import { NotFound } from "~/components/not-found";
import type { Note } from "../lib/types";

export function NotesPage() {
  const data = useLoaderData({ from: "/notes/" }) as { notes: Note[] } | null;

  const [, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);

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

  const { notes } = data;

  const handleSearch = (query: string, results: Note[] | null) => {
    setSearchQuery(query);
    setSearchResults(results);
  };

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
    </div>
  );
}
