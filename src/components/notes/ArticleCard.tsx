import type { Note } from "#/types/notes";
import CalendarIcon from "~icons/ph/calendar-blank";
import LinkIcon from "~icons/ph/link";

interface ArticleCardProps {
  note: Note;
}

export function ArticleCard({ note }: ArticleCardProps) {
  return (
    <a
      href={note.domain || `/notes/${note.slug}`}
      target={note.domain ? "_blank" : undefined}
      rel={note.domain ? "noopener noreferrer" : undefined}
      className="group block relative bg-white/60 border border-pink-200/50 p-4 hover:bg-white hover:shadow-card transition-all"
    >
      {/* Bocchi hairtie decoration */}
      <div className="absolute -top-1.5 left-4 w-3 h-3 rounded-full bg-pink-300/60 group-hover:bg-pink-400/80 transition-colors" />

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors line-clamp-2">
          {note.title}
        </h3>
        {note.domain && (
          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-mono text-pink-950/50 bg-pink-50/80 px-2 py-0.5">
            <LinkIcon className="w-3 h-3" />
            {note.domain}
          </span>
        )}
      </div>

      {note.description && (
        <p className="text-sm text-pink-950/60 mt-2 line-clamp-2">{note.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {note.tags
          .filter((t) => t !== "public")
          .map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono text-pink-950/50 bg-pink-50/60 px-1.5 py-0.5"
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
