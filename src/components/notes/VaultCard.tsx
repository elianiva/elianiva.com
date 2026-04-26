import type { Note } from "#/types/notes";
import CalendarIcon from "~icons/ph/calendar-blank";

interface VaultCardProps {
  note: Note;
}

export function VaultCard({ note }: VaultCardProps) {
  return (
    <a
      href={`/notes/${note.slug}`}
      className="group block relative bg-white/60 border border-pink-200/50 p-4 hover:bg-white hover:shadow-card transition-all"
    >
      {/* Folded corner decoration */}
      <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-bl from-sky-100 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

      <h3 className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors line-clamp-2">
        {note.title}
      </h3>

      {note.description && (
        <p className="text-sm text-pink-950/60 mt-2 line-clamp-2">{note.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {note.tags
          .filter((t) => t !== "public")
          .map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono text-sky-700/60 bg-sky-50/60 px-1.5 py-0.5"
            >
              #{tag}
            </span>
          ))}
        <div className="flex items-center gap-1 text-xs text-pink-950/40 ml-auto">
          <CalendarIcon className="w-3 h-3" />
          {new Date(note.date).toLocaleDateString("en-GB", {
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>
    </a>
  );
}
