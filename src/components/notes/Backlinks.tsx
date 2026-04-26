import type { Note } from "#/types/notes";
import ArrowLeftIcon from "~icons/ph/arrow-left";

interface BacklinksProps {
  notes: Note[];
  currentSlug: string;
}

export function Backlinks({ notes, currentSlug }: BacklinksProps) {
  const currentNote = notes.find((n) => n.slug === currentSlug);
  if (!currentNote || currentNote.backlinks.length === 0) return null;

  const backlinkNotes = currentNote.backlinks
    .map((slug) => notes.find((n) => n.slug === slug))
    .filter(Boolean) as Note[];

  return (
    <div className="mt-12 pt-6 border-t border-pink-200/50">
      <h3 className="text-sm font-mono text-pink-950/50 uppercase tracking-wider mb-4 flex items-center gap-2">
        <ArrowLeftIcon className="w-4 h-4" />
        Backlinks
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {backlinkNotes.map((note) => (
          <a
            key={note.slug}
            href={`/notes/${note.slug}`}
            className="group block bg-white/60 border border-pink-200/50 p-3 hover:bg-white hover:shadow-card transition-all"
          >
            <h4 className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors text-sm">
              {note.title}
            </h4>
            {note.description && (
              <p className="text-xs text-pink-950/50 mt-1 line-clamp-2">
                {note.description}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
