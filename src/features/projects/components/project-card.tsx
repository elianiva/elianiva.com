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
  return (
    <Card
      className="bg-white/60 text-left px-4 py-3 transition-colors group hover:bg-white h-full flex flex-col border-0 ring-0"
      style={{ viewTransitionName: `project-card-${slug}` }}
    >
      <div className="flex gap-4 flex-1 items-center">
        <div
          className={cn(
            "relative flex items-center justify-center border-2 border-border uppercase h-11 w-11 font-black",
            "before:absolute before:content-[''] before:-left-0.5 before:-bottom-0.5 before:size-0 before:border-t-44 before:border-r-44 before:border-t-pink-100/50 before:border-r-pink-200/50",
          )}
        >
          <span className="z-20 text-2xl text-pink-700">{title[0]}</span>
        </div>
        <div className="flex-1">
          <Link
            to="/projects/$slug"
            params={{ slug }}
            className="text-base font-bold font-display text-pink-950 group-hover:text-pink-700 transition-colors duration-100 ease-out focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
          >
            {title}
          </Link>
          <p className="font-body text-sm text-pink-950/70 text-clip line-clamp-1">{description}</p>
        </div>
        <div className="flex flex-wrap items-start gap-1 font-mono uppercase">
          {stack.map((item) => {
            const [name, url] = item;
            return (
              <Badge
                key={name}
                variant="secondary"
                render={
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {name}
                  </a>
                }
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}
