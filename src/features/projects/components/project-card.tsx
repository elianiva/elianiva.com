import { Link } from "@tanstack/react-router";

interface ProjectCardProps {
  slug: string;
  title: string;
  description: string;
  stack: string[][];
}

const VISIBLE = 3;

export function ProjectCard({ slug, title, description, stack }: ProjectCardProps) {
  const tags = stack.length > 0 && (
    <span className="font-mono text-xs text-pink-400">
      {stack
        .slice(0, VISIBLE)
        .map(([name]) => `#${name.toLowerCase().replace(/\s+/g, "-")}`)
        .join(" ")}
      {stack.length > VISIBLE && <span className="text-pink-300"> +{stack.length - VISIBLE}</span>}
    </span>
  );

  return (
    <Link
      to="/projects/$slug"
      params={{ slug }}
      className="group block px-3 py-2 border-t border-pink-200/50 first:border-t-0 hover:bg-white/70 transition-colors focus-visible:outline-2 focus-visible:outline-pink-400"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors">
          {title}
        </span>
        <span className="hidden md:inline shrink-0">{tags}</span>
      </div>
      <div className="font-body text-sm text-pink-950/60 truncate">{description}</div>
      <div className="md:hidden">{tags}</div>
    </Link>
  );
}
