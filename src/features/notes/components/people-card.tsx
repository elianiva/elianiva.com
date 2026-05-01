import { Link } from "@tanstack/react-router";
import type { Note } from "../lib/types";

interface PeopleCardProps {
  note: Note;
}

export function PeopleCard({ note }: PeopleCardProps) {
  return (
    <div className="bg-white/60 border border-pink-200/50 p-4 hover:bg-white transition-all">
      <Link to={`/notes/${note.slug}`} className="block focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2">
        <h3 className="font-display font-semibold text-pink-950 text-sm mb-1">{note.title}</h3>
        {note.links && note.links.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {note.links.map((link) => (
              <span key={link} className="text-xs text-pink-950/40 font-mono">{link}</span>
            ))}
          </div>
        )}
      </Link>
    </div>
  );
}
