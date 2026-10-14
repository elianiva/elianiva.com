import { Link } from "@tanstack/react-router";
import * as DateTime from "effect/DateTime";

type PostRowProps = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
};

export function PostRow({ slug, title, description, date, tags }: PostRowProps) {
  return (
    <Link
      to="/posts/$slug"
      params={{ slug }}
      className="group grid md:grid-cols-[6.5rem_1fr] gap-x-4 px-3 py-2.5 hover:bg-white/70 transition-colors"
    >
      <span className="font-mono text-xs text-pink-950/50 md:pt-1.5" suppressHydrationWarning>
        {DateTime.format(DateTime.makeUnsafe(date), {
          locale: "en-GB",
          month: "short",
          year: "numeric",
        })}
      </span>
      <div className="min-w-0">
        <div className="font-display font-semibold capitalize text-pink-950 group-hover:text-pink-700 transition-colors">
          {title}
        </div>
        <div className="font-body text-sm text-pink-950/60 truncate">{description}</div>
        {tags && tags.length > 0 && (
          <div className="font-mono text-xs text-pink-400 pt-0.5">
            {tags.map((t) => `#${t}`).join(" ")}
          </div>
        )}
      </div>
    </Link>
  );
}
