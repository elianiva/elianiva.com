import { Link } from "@tanstack/react-router";
import type { Note } from "~/types/notes";

interface MusicCardProps {
  note: Note;
}

export function MusicCard({ note }: MusicCardProps) {
  const displayYear =
    note.year && Array.isArray(note.year)
      ? note.year.length > 1
        ? `${note.year[0]}-${note.year[note.year.length - 1]}`
        : String(note.year[0])
      : note.year
        ? String(note.year)
        : "";

  return (
    <article style={{ viewTransitionName: `note-card-${note.slug}` }}>
      <Link
        to={`/notes/${note.slug}` as any}
        className="flex items-center gap-3 px-3 py-2 bg-white/60 border border-purple-200 hover:bg-white/80 transition-colors duration-200"
      >
        {/* album art placeholder */}
        <div className="shrink-0 w-12 h-12 bg-purple-100/70 border border-purple-200 flex items-center justify-center hover:bg-purple-100 transition-colors">
          <svg
            className="w-5 h-5 text-purple-400"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6zm-2 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-semibold text-pink-950 hover:text-purple-700 transition-colors truncate leading-snug">
            {note.title}
          </h3>
          {note.artist && <p className="text-xs text-pink-950/60 mt-0.5 truncate">{note.artist}</p>}
          {note.description && (
            <p className="text-xs text-pink-950/40 truncate">{note.description}</p>
          )}
        </div>

        {displayYear && (
          <span className="shrink-0 text-xs font-mono text-purple-400 self-start pt-0.5">
            {displayYear}
          </span>
        )}
      </Link>
    </article>
  );
}
