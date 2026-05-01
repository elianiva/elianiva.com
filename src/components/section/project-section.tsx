import { Suspense } from "react";
import { ProjectCard } from "~/components/card/project-card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProjects } from "~/lib/projects";
import { Heading } from "~/components/ui/heading";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { Link } from "@tanstack/react-router";
import { AnimatedSection } from "~/components/ui/animated-section";
import { AnimatedItem } from "~/components/ui/animated-item";

interface ProjectSectionProps {
  title: string;
  description: string;
  seeMoreUrl?: string | null;
}

function ProjectCardList() {
  const { data: projects } = useSuspenseQuery({
    queryKey: ["personal-projects"],
    queryFn: () =>
      getProjects({
        data: {
          type: "personal" as const,
          featured: true,
        },
      }),
    staleTime: Infinity,
  });

  return (
    <>
      {projects.map((project) => (
        <AnimatedItem key={project.slug} className="h-full">
          <ProjectCard
            slug={project.slug}
            title={project.title}
            description={project.description}
            href={`/projects/${project.slug}`}
            stack={project.stack || []}
          />
        </AnimatedItem>
      ))}
    </>
  );
}

export function ProjectSection({ title, description, seeMoreUrl }: ProjectSectionProps) {
  const headingId =
    title
      .toLowerCase()
      .replace(/s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") + "-heading";

  return (
    <AnimatedSection className="py-4 md:py-8 pl-2 md:pl-8">
      <AnimatedItem>
        <Heading level={2} id={headingId}>
          {title}
        </Heading>
      </AnimatedItem>
      <AnimatedItem>
        <p className="text-xs md:text-base font-body text-pink-950/70 pt-2 pb-4">{description}</p>
      </AnimatedItem>
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
          <ProjectCardList />
        </Suspense>
      </div>
      {typeof seeMoreUrl === "string" && (
        <AnimatedItem className="flex justify-end">
          <Button
            render={<Link to={seeMoreUrl} />}
            variant="link"
            className="text-sm p-0 font-normal"
          >
            View All Projects
          </Button>
        </AnimatedItem>
      )}
    </AnimatedSection>
  );
}