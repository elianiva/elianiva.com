import { useLoaderData } from "@tanstack/react-router";
import { BackButton } from "~/components/back-button";
import { Backlinks } from "./backlinks";
import { NotFound } from "~/components/not-found";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import wikiLinkPlugin from "@flowershow/remark-wiki-link";
import type { Note } from "../lib/types";

const categoryLabels: Record<string, string> = {
  article: "Article",
  vault: "Vault",
  person: "Person",
  music: "Music",
  articles: "Article",
  people: "Person",
};

export function NoteDetailPage() {
  const data = useLoaderData({ from: "/notes/$slug" }) as {
    note: Note;
    notes: Note[];
  } | null;

  if (!data) {
    return (
      <NotFound
        path="notes"
        label="Digital Garden"
        title="This note faded out of the vault."
        description="The note you asked for is missing or private. Try another path back into the garden."
        backTo={{ to: "/notes", label: "Notes index" }}
      />
    );
  }

  const { note, notes } = data;
  const displayTags = note.tags.filter((t) => t !== "public");
  const createdDate = new Date(note.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const modifiedDate = note.modifiedAt
    ? new Date(note.modifiedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <BackButton />
      <article className="mt-6">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {note.category && (
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-pink-400">
                {categoryLabels[note.category] || note.category}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-pink-950 tracking-wide">
            {note.title}
          </h1>
          {note.description && (
            <p className="mt-3 text-pink-950/70 font-body">{note.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-4 font-mono text-xs text-pink-400">
            <span>Created {createdDate}</span>
            {modifiedDate && <span>Updated {modifiedDate}</span>}
          </div>
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs font-mono bg-pink-50 border border-pink-200 text-pink-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        <div className="prose prose-pink max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm, wikiLinkPlugin]}>{note.content}</ReactMarkdown>
        </div>
      </article>
      <Backlinks notes={notes} currentSlug={note.slug} />
    </div>
  );
}
