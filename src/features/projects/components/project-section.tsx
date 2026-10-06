import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProjects } from "../lib/projects";
import type { ProjectType } from "~/features/content/lib/projects";
import { Heading } from "~/components/ui/heading";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ProjectCard } from "./project-card";

interface ProjectSectionProps {
  title: string;
  description: string;
  seeMoreUrl?: string | null;
  type?: ProjectType;
  featured?: boolean;
}

function ProjectCardFallback() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-18 w-full" />
      ))}
    </div>
  );
}

function ProjectCardList({ type, featured }: { type: ProjectType; featured: boolean }) {
  const { data: projects } = useSuspenseQuery({
    queryKey: ["projects", type, featured],
    queryFn: () => getProjects({ type, featured }),
    staleTime: Infinity,
  });

  return (
    <>
      {projects.map((project) => (
        <ProjectCard
          key={project.slug}
          slug={project.slug}
          title={project.title}
          description={project.description}
          stack={project.stack}
        />
      ))}
    </>
  );
}

export function ProjectSection({
  title,
  description,
  seeMoreUrl,
  type = "personal",
  featured = true,
}: ProjectSectionProps) {
  const headingId = `${title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")}-heading`;

  return (
    <section aria-labelledby={headingId}>
      <Heading level={2} id={headingId}>
        {title}
      </Heading>
      <p className="text-xs md:text-base font-body text-pink-950/70 pt-2 pb-4">{description}</p>
      <div className="relative pb-4 items-stretch grid grid-cols-[repeat(auto-fit,minmax(min(600px,100%),1fr))] gap-1">
        <Suspense fallback={<ProjectCardFallback />}>
          <ProjectCardList type={type} featured={featured} />
        </Suspense>
      </div>
      {seeMoreUrl && (
        <div className="flex justify-end">
          <Button
            render={<Link to={seeMoreUrl} />}
            variant="link"
            className="text-sm p-0 font-normal"
          >
            See More Projects
          </Button>
        </div>
      )}
    </section>
  );
}
