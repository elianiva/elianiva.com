import type { Note } from "#/types/notes";

interface VaultCardProps {
  note: Note;
}

export function VaultCard({ note }: VaultCardProps) {
  const date = new Date(note.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const displayTags = note.tags
    .filter((t) => t !== "public" && t !== "vault")
    .slice(0, 4);
  const extraTags = note.tags.filter((t) => t !== "public" && t !== "vault").length - 4;

  return (
    <article style={{ viewTransitionName: `note-card-${note.slug}` }}>
      <a
        href={`/notes/${note.slug}`}
        className="relative block p-4 bg-white/60 border border-sky-200 hover:bg-white/80 transition-colors duration-200 overflow-hidden"
        style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)" }}
      >
        {/* folded corner */}
        <div
          className="absolute top-0 right-0 w-0 h-0 border-l-[16px] border-b-[16px] border-l-sky-200 border-b-transparent hover:border-l-sky-300 transition-colors"
        ></div>

        <h3 className="font-display text-base font-semibold text-pink-950 hover:text-sky-700 transition-colors leading-snug pr-3">
          {note.title}
        </h3>
        {note.description && (
          <p className="text-sm text-pink-950/60 mt-1 line-clamp-2">{note.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {displayTags.map((tag) => (
            <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-sky-100/60 text-sky-800">
              #{tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="text-xs text-pink-950/40">+{extraTags}</span>
          )}
        </div>

        <div className="mt-3 text-xs text-pink-950/40">
          <time dateTime={note.date}>{date}</time>
        </div>
      </a>
    </article>
  );
}
