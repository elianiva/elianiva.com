import type { Note } from "#/types/notes";
import UserIcon from "~icons/ph/user";
import LinkIcon from "~icons/ph/link";

interface PeopleCardProps {
  note: Note;
}

export function PeopleCard({ note }: PeopleCardProps) {
  const initials = note.title
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <a
      href={`/notes/${note.slug}`}
      className="group block relative bg-white/60 border border-pink-200/50 p-4 hover:bg-white hover:shadow-card transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Initial avatar */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-yellow-100 flex items-center justify-center text-sm font-display font-bold text-pink-800">
          {initials || <UserIcon className="w-4 h-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors truncate">
            {note.title}
          </h3>
          {note.description && (
            <p className="text-sm text-pink-950/60 line-clamp-2">{note.description}</p>
          )}
        </div>
      </div>

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
        {note.backlinks.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-pink-950/40 ml-auto">
            <LinkIcon className="w-3 h-3" />
            {note.backlinks.length} backlink{note.backlinks.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </a>
  );
}
