import { ProjectCard } from "#/components/card/ProjectCard";
import { ViewAllButton } from "#/components/ViewAllButton";
import type { Project } from "content-collections";

interface ProjectSectionProps {
  projects: Project[];
  title: string;
  description: string;
  seeMoreUrl?: string | null;
}

export function ProjectSection({
  projects,
  title,
  description,
  seeMoreUrl,
}: ProjectSectionProps) {
  const headingId = title
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
      <p
        data-anime
        className="text-xs md:text-base font-body text-pink-950/70 pt-2 pb-4"
      >
        {description}
      </p>
      <div className="relative grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3 pb-4 card-tilt-odd">
        {projects.map((project) => (
          <div key={project.slug} data-anime>
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
