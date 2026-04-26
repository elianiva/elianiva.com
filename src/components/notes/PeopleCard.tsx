import type { Note } from "#/types/notes";

interface PeopleCardProps {
  note: Note;
}

export function PeopleCard({ note }: PeopleCardProps) {
  const initial = note.title.charAt(0).toUpperCase();
  const displayTags = note.tags
    .filter((t) => t !== "public" && t !== "person")
    .slice(0, 3);

  return (
    <article style={{ viewTransitionName: `note-card-${note.slug}` }}>
      <a
        href={`/notes/${note.slug}`}
        className="flex items-center gap-3 p-3 bg-white/60 border border-dashed border-pink-200 hover:bg-white/80 transition-colors duration-200"
      >
        {/* avatar */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-pink-100/70 border border-dashed border-pink-200 flex items-center justify-center hover:bg-pink-100 transition-colors">
          <span className="font-display text-sm font-bold text-pink-500">{initial}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-semibold text-pink-950 hover:text-pink-700 transition-colors truncate">
            {note.title}
          </h3>
          {displayTags.length > 0 && (
            <p className="text-xs text-pink-950/50 mt-0.5 truncate">
              {displayTags.map((t) => `#${t}`).join(" ")}
            </p>
          )}
        </div>

        {note.backlinks.length > 0 && (
          <span className="shrink-0 text-xs text-pink-400 whitespace-nowrap">
            ← {note.backlinks.length}
          </span>
        )}
      </a>
    </article>
  );
}
