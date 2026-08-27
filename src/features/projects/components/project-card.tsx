import { Link } from "@tanstack/react-router";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface ProjectCardProps {
  slug: string;
  title: string;
  description: string;
  stack: string[][];
}

export function ProjectCard({ slug, title, description, stack }: ProjectCardProps) {
  const VISIBLE = 3;
  const visible = stack.slice(0, VISIBLE);
  const hidden = stack.slice(VISIBLE);

  return (
    <Card
      className="bg-white/60 text-left px-4 py-3 transition-colors group hover:bg-white hover:border-pink-200 border border-transparent h-full flex flex-col ring-0"
      style={{ viewTransitionName: `project-card-${slug}` }}
    >
      <div className="flex gap-4 flex-1 items-start">
        <div
          className={cn(
            "relative flex items-center justify-center border-2 border-border uppercase h-11 w-11 font-black shrink-0",
            "before:absolute before:content-[''] before:-left-0.5 before:-bottom-0.5 before:w-0 before:h-0 before:border-t-[11px] before:border-r-[11px] before:border-t-pink-100/50 before:border-r-transparent",
          )}
        >
          <span className="z-20 text-2xl text-pink-700">{title[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to="/projects/$slug"
            params={{ slug }}
            className="text-base font-bold font-display text-pink-950 group-hover:text-pink-700 transition-colors duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
          >
            {title}
          </Link>
          <p className="font-body text-sm text-pink-950/70 text-clip line-clamp-1">{description}</p>
          {stack.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              {visible.map((item) => {
                const [name, url] = item;
                return (
                  <Badge
                    key={name}
                    variant="secondary"
                    className="h-auto min-h-0 px-1.5 py-0 text-[10px] leading-5 font-mono uppercase tracking-wide bg-pink-50 text-pink-900/70 border border-pink-100 hover:bg-pink-100"
                    render={
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {name}
                      </a>
                    }
                  />
                );
              })}
              {hidden.length > 0 && (
                <span className="group/more relative inline-flex">
                  <span className="inline-flex items-center px-1.5 py-0 text-[10px] leading-5 font-mono uppercase tracking-wide bg-white border border-pink-200 text-pink-700 cursor-default">
                    +{hidden.length}
                  </span>
                  <span className="pointer-events-none hidden group-hover/more:block absolute left-0 top-full mt-1 z-10 whitespace-nowrap bg-pink-950 text-white text-[11px] font-mono px-2 py-1 shadow-md">
                    {hidden.map(([n]) => n).join(" · ")}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
