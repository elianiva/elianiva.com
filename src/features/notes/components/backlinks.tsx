import { Link } from "@tanstack/react-router";
import type { Note } from "../lib/types";

interface BacklinksProps {
  notes: Note[];
  currentSlug: string;
}

export function Backlinks({ notes, currentSlug }: BacklinksProps) {
  const currentNote = notes.find((n) => n.slug === currentSlug);
  if (!currentNote || currentNote.backlinks.length === 0) return null;

  const backlinkNotes = currentNote.backlinks
    .map((slug) => notes.find((n) => n.slug === slug))
    .filter((n): n is Note => n !== undefined);

  if (backlinkNotes.length === 0) return null;

  return (
    <div className="mt-12 pt-6 border-t border-pink-200/50">
      <h2 className="font-display text-lg font-bold text-pink-950 mb-4">
        Backlinks
      </h2>
      <div className="flex flex-col gap-2">
        {backlinkNotes.map((note) => (
          <Link
            key={note.slug}
            to={`/notes/${note.slug}`}
            className="group flex items-center gap-3 p-3 bg-white/60 hover:bg-white border border-pink-200/50 transition-all"
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
              {note.category}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
