import { Suspense } from "react";
import { ProjectCard } from "./project-card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProjects, type ProjectType } from "../lib/projects";
import { Heading } from "~/components/ui/heading";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { Link } from "@tanstack/react-router";

interface ProjectSectionProps {
  title: string;
  description: string;
  seeMoreUrl?: string | null;
  type?: ProjectType;
  featured?: boolean;
}

function ProjectCardList({ type = "personal", featured = true }: { type: ProjectType; featured: boolean }) {
  const { data: projects } = useSuspenseQuery({
    queryKey: ["projects", type, featured],
    queryFn: () =>
      getProjects({
        data: {
          type,
          featured,
        },
      }),
    staleTime: Infinity,
  });

  return (
    <>
      {projects.map((project) => (
        <div key={project.slug} className="h-full">
          <ProjectCard
            slug={project.slug}
            title={project.title}
            description={project.description}
            href={`/projects/${project.slug}`}
            stack={project.stack}
          />
        </div>
      ))}
    </>
  );
}

export function ProjectSection({ title, description, seeMoreUrl, type = "personal", featured = true }: ProjectSectionProps) {
  const headingId =
    title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") + "-heading";

  return (
    <section className="py-4 md:py-8">
      <div>
        <Heading level={2} id={headingId}>
          {title}
        </Heading>
      </div>
      <div>
        <p className="text-xs md:text-base font-body text-pink-950/70 pt-2 pb-4">{description}</p>
      </div>
      <div className="relative space-y-1 pb-4 card-tilt-odd items-stretch">
        <Suspense
          fallback={
            <div className="space-y-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-18 w-full" />
              ))}
            </div>
          }
        >
          <ProjectCardList type={type} featured={featured} />
        </Suspense>
      </div>
      {seeMoreUrl && (
        <Link to={seeMoreUrl}>
          <Button variant="outline" className="text-sm">
            See more →
          </Button>
        </Link>
      )}
    </section>
  );
}
