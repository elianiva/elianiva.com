import type { Note } from "~/types/notes";

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
    <aside className="mt-12 pt-8 border-t border-dashed border-pink-200">
      <h2 className="font-display text-lg font-semibold text-pink-950 mb-4">Linked from</h2>
      <ul className="space-y-3">
        {backlinkNotes.map((backlink) => (
          <li key={backlink.slug}>
            <a
              href={`/notes/${backlink.slug}`}
              className="group block p-3 bg-white/40 border border-dashed border-pink-200 hover:bg-white/60 transition-colors"
            >
              <span className="font-medium text-pink-950 group-hover:text-pink-700 transition-colors">
                {backlink.title}
              </span>
              {backlink.description && (
                <p className="text-sm text-pink-950/50 mt-1 line-clamp-2">{backlink.description}</p>
              )}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
