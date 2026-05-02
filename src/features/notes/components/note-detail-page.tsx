import { Link } from "@tanstack/react-router";
import { BackButton } from "~/components/back-button";
import { Backlinks } from "./backlinks";
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

interface NoteDetailPageProps {
  note: Note;
  notes: Note[];
}

export function NoteDetailPage({ note, notes }: NoteDetailPageProps) {
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

  const backlinks = notes.filter((n) =>
    n.content?.includes(`[[${note.slug}]]`),
  );

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
          <h1 className="font-display text-3xl md:text-4xl font-bold text-pink-950 tracking-wide">
            {note.title}
          </h1>
          {note.description && (
            <p className="mt-3 text-pink-950/70 font-body">{note.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-4 font-mono text-xs text-pink-400">
            <span>Created {createdDate}</span>
            {modifiedDate && <span>Updated {modifiedDate}</span>}
            {note.readingTime && <span>{note.readingTime} min read</span>}
            {note.wordCount && <span>{note.wordCount} words</span>}
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
          <ReactMarkdown
            remarkPlugins={[remarkGfm, wikiLinkPlugin]}
          >
            {note.content}
          </ReactMarkdown>
        </div>
      </article>
      {backlinks.length > 0 && (
        <section className="mt-12 pt-8 border-t border-pink-200/50">
          <h2 className="font-display text-xl text-pink-800 mb-4">Backlinks</h2>
          <Backlinks backlinks={backlinks} />
        </section>
      )}
      <nav className="mt-12 pt-8 border-t border-pink-200/50 flex justify-between font-mono text-sm">
        {note.prevSlug ? (
          <Link
            to="/notes/$slug"
            params={{ slug: note.prevSlug }}
            className="text-pink-600 hover:text-pink-800"
          >
            ← prev
          </Link>
        ) : (
          <span />
        )}
        {note.nextSlug ? (
          <Link
            to="/notes/$slug"
            params={{ slug: note.nextSlug }}
            className="text-pink-600 hover:text-pink-800"
          >
            next →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
