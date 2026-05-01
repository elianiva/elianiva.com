import { Link } from "@tanstack/react-router";
import type { Note } from "../lib/types";

interface MusicCardProps {
  note: Note;
}

export function MusicCard({ note }: MusicCardProps) {
  return (
    <div className="bg-white/60 border border-pink-200/50 p-4 hover:bg-white transition-all">
      <Link to={`/notes/${note.slug}`} className="block focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2">
        <h3 className="font-display font-semibold text-pink-950 text-sm mb-1">{note.title}</h3>
        <div className="flex items-center gap-2 text-xs text-pink-950/60 font-mono">
          {note.artist && <span>{note.artist}</span>}
          {note.album && <span>· {note.album}</span>}
          {note.year && <span>· {note.year.join(", ")}</span>}
        </div>
      </Link>
    </div>
  );
}
