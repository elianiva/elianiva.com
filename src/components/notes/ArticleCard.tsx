import { Link } from "@tanstack/react-router";
import type { Note } from "#/types/notes";

interface ArticleCardProps {
  note: Note;
}

export function ArticleCard({ note }: ArticleCardProps) {
  const date = new Date(note.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const domain = note.domain ? new URL(note.domain).hostname.replace(/^www./, "") : "";
  const displayTags = note.tags.filter((t) => t !== "public" && t !== "article").slice(0, 3);

  const cardContent = (
    <>
      {/* bocchi hairtie */}
      <div
        className="
          relative w-3 h-full bg-sky-300
          before:content-[''] before:absolute before:left-3 before:top-4 before:size-3 before:rounded-sm before:bg-sky-300/60
          after:content-[''] after:absolute after:left-3 after:top-8 after:size-3 after:rounded-sm after:bg-yellow-300/60
        "
      ></div>

      <div className="flex-1 p-3 min-w-0">
        <h3 className="font-display text-base font-semibold text-pink-950 hover:text-sky-700 transition-colors leading-snug">
          {note.title}
        </h3>
        {note.description && (
          <p className="text-sm text-pink-950/60 mt-1 line-clamp-2">{note.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-pink-950/50">
          {domain && (
            <span className="px-2 py-0.5 bg-sky-100/70 text-sky-800 font-medium">{domain}</span>
          )}
          {note.author && (
            <>
              <span className="text-pink-950/60">{note.author}</span>
              <span>·</span>
            </>
          )}
          <time dateTime={note.date}>{date}</time>
          {displayTags.length > 0 && (
            <>
              <span>·</span>
              <span className="truncate">{displayTags.map((t) => `#${t}`).join(" ")}</span>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <article style={{ viewTransitionName: `note-card-${note.slug}` }}>
      {note.domain ? (
        <a
          href={note.domain}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-2 bg-white/60 border border-pink-200/50 hover:bg-white/80 transition-colors duration-200 overflow-hidden"
        >
          {cardContent}
        </a>
      ) : (
        <Link
          to={`/notes/${note.slug}` as any}
          className="flex gap-2 bg-white/60 border border-pink-200/50 hover:bg-white/80 transition-colors duration-200 overflow-hidden"
        >
          {cardContent}
        </Link>
      )}
    </article>
  );
}
