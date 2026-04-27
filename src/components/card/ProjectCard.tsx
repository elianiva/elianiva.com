import { Link } from "@tanstack/react-router";

interface ProjectCardProps {
  slug: string;
  title: string;
  description: string;
  href: string;
  stack: string[][];
  hasImage?: boolean;
}

export function ProjectCard({
  slug,
  title,
  description,
  href,
  stack,
  hasImage = true,
}: ProjectCardProps) {
  return (
    <div
      className="bg-white/60 text-left p-4 transition-all group hover:bg-white"
      style={{ viewTransitionName: `project-card-${slug}` }}
    >
      <div className="relative overflow-hidden border-[0.5px] border-pink-200/50">
        <div className="absolute inset-0 bg-pink-200/10 z-10 group-hover:opacity-0 transition-all duration-150" />
        {hasImage ? (
          <img
            src={`/assets/projects/${slug}/cover.webp`}
            alt={`Screenshot of ${title} project interface`}
            className="inline-block w-full h-auto aspect-video bg-white transition-all duration-150 grayscale group-hover:grayscale-0"
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              img.style.display = "none";
              const fallback = img.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="w-full h-auto aspect-video items-center justify-center text-xs font-light uppercase text-pink-800/50 tracking-wider bg-white"
          style={{ display: hasImage ? "none" : "flex" }}
        >
          {title}
        </div>
      </div>
      <div className="grid grid-rows-[auto_auto_auto] pt-4">
        <Link
          to={href as any}
          className="text-base font-bold font-display text-pink-950 group-hover:text-pink-700 transition-property-color duration-100 ease-out focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
        >
          {title}
        </Link>
        <p className="font-body text-sm text-pink-950/70 pt-1 pb-3">{description}</p>
        <div className="flex flex-wrap items-end gap-1 font-mono uppercase">
          {stack.map((item) => {
            const [name, url] = item;
            return (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-pink-800 bg-pink-50/80 px-3 py-1 focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-1 transition-colors"
              >
                {name}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
