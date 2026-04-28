import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allProjects } from "content-collections";
import { ProjectCard } from "~/components/card/project-card";
import { ViewAllButton } from "~/components/view-all-button";
import { Heading } from "../ui/heading";

export type ProjectType = "personal" | "open-source" | "assignment";

export interface ProjectSectionProps {
  title: string;
  description: string;
  type: ProjectType;
  featured?: boolean;
  seeMoreUrl?: string | null;
}

export const getProjectSection = createServerFn({ method: "GET" })
  .inputValidator((input: ProjectSectionProps) => input)
  .handler(async ({ data: { title, description, type, featured = false, seeMoreUrl } }) => {
    const projects = allProjects
      .filter((p) => p.type === type)
      .sort((a, b) => (a.date > b.date ? -1 : 1))
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        stack: p.stack,
        featured: p.featured,
      }));

    const filtered = featured ? projects.filter((p) => p.featured) : projects;

    const headingId =
      title
        .toLowerCase()
        .replace(/s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") + "-heading";

    return renderServerComponent(
      <section className="py-4 md:py-8 px-2 md:px-8">
        <Heading level={2} data-anime id={headingId}>
          {title}
        </Heading>
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
      </section>,
    );
  });
