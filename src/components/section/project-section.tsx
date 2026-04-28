import { useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { allProjects } from "content-collections";
import { ProjectCard } from "~/components/card/project-card";
import { ViewAllButton } from "~/components/view-all-button";


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

export function ProjectSection({
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
      .replace(/s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") + "-heading";

  return (
    <section className="py-4 md:py-8 px-2 md:px-8">
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
    </section>
  );
}
