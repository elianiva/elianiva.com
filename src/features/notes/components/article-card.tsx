import { Link } from "@tanstack/react-router";
import type { Note } from "../lib/types";

interface ArticleCardProps {
  note: Note;
}

export function ArticleCard({ note }: ArticleCardProps) {
  return (
    <div className="bg-white/60 border border-pink-200/50 p-4 hover:bg-white transition-all">
      <Link to={`/notes/${note.slug}`} className="block focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2">
        <h3 className="font-display font-semibold text-pink-950 text-sm mb-1">{note.title}</h3>
        {note.description && (
          <p className="text-xs text-pink-950/60 line-clamp-2">{note.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-pink-950/40 font-mono">
          {note.domain && <span>{note.domain}</span>}
          {note.author && <span>by {note.author}</span>}
          <span>{new Date(note.date).toLocaleDateString("en-GB")}</span>
        </div>
      </Link>
    </div>
  );
}
