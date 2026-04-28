import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { allProjects } from "content-collections";
import { ProjectCard } from "~/components/card/project-card";
import { ViewAllButton } from "~/components/view-all-button";
import { Skeleton } from "~/components/ui/skeleton";

type ProjectType = "personal" | "open-source" | "assignment";

interface ProjectSectionProps {
  title: string;
  description: string;
  type: ProjectType;
  featured?: boolean;
  seeMoreUrl?: string | null;
}

const getProjects = createServerFn({ method: "GET" })
  .inputValidator((type: ProjectType) => type)
  .handler(async ({ data: type }) => {
    return allProjects
      .filter((p) => p.type === type)
      .sort((a, b) => (a.date > b.date ? -1 : 1))
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        hasImage: p.hasImage,
        stack: p.stack,
        featured: p.featured,
      }));
  });

function ProjectSkeleton() {
  return (
    <section className="py-4 md:py-8 px-2 md:px-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-5 w-full max-w-xl mb-4" />
      <div className="relative grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3 pb-4 card-tilt-odd items-stretch">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/60 p-4 h-full flex flex-col gap-3">
            <Skeleton className="w-full aspect-video" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-12 w-full" />
            <div className="flex gap-1 mt-auto">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectSectionContent({
  title,
  description,
  type,
  featured = false,
  seeMoreUrl,
}: ProjectSectionProps) {
  const { data: projects } = useSuspenseQuery({
    queryKey: ["projects", type],
    queryFn: () => getProjects({ data: type }),
  });

  const filtered = featured ? projects.filter((p) => p.featured) : projects;

  const headingId =
    title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") + "-heading";

  return (
    <>
      <h2
        data-anime
        id={headingId}
        className="text-2xl font-bold font-display text-pink-950 tracking-wide pt-2"
      >
        {title}
      </h2>
      <p data-anime className="text-xs md:text-base font-body text-pink-950/70 pt-2 pb-4">
        {description}
      </p>
      <div className="relative grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3 pb-4 card-tilt-odd items-stretch">
        {filtered.map((project) => (
          <div key={project.slug} data-anime className="h-full">
            <ProjectCard
              slug={project.slug}
              title={project.title}
              description={project.description}
              href={`/projects/${project.slug}`}
              stack={project.stack || []}
              hasImage={project.hasImage}
            />
          </div>
        ))}
      </div>
      {typeof seeMoreUrl === "string" && (
        <div data-anime>
          <ViewAllButton
            href={seeMoreUrl}
            label="View all projects"
            ariaLabel="View all projects"
          />
        </div>
      )}
    </>
  );
}

export function ProjectSection(props: ProjectSectionProps) {
  return (
    <Suspense fallback={<ProjectSkeleton />}>
      <section className="py-4 md:py-8 px-2 md:px-8">
        <ProjectSectionContent {...props} />
      </section>
    </Suspense>
  );
}
