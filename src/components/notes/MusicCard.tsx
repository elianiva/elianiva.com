import type { Note } from "#/types/notes";
import MusicNoteIcon from "~icons/ph/music-note";

interface MusicCardProps {
  note: Note;
}

export function MusicCard({ note }: MusicCardProps) {
  return (
    <a
      href={`/notes/${note.slug}`}
      className="group block relative bg-white/60 border border-pink-200/50 p-4 hover:bg-white hover:shadow-card transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Album art placeholder */}
        <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          <MusicNoteIcon className="w-6 h-6 text-purple-400" />
        </div>

        <div className="min-w-0">
          <h3 className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors truncate">
            {note.title}
          </h3>
          {note.artist && (
            <p className="text-sm text-pink-950/60">{note.artist}</p>
          )}
          {note.album && (
            <p className="text-xs text-pink-950/40">
              {note.album}
              {note.year && ` (${note.year})`}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {note.tags
          .filter((t) => t !== "public")
          .map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono text-purple-700/60 bg-purple-50/60 px-1.5 py-0.5"
            >
              #{tag}
            </span>
          ))}
      </div>
    </a>
  );
}
