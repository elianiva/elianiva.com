import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allProjects } from "content-collections";
import { ProjectCard } from "../components/project-card";

export type ProjectType = "personal" | "open-source" | "assignment";

export type ProjectSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  stack: Array<[string, string]>;
  featured: boolean;
};

export const getProjects = createServerFn({ method: "GET" })
  .inputValidator((input: { type: ProjectType; featured?: boolean }) => input)
  .handler(async ({ data: { type, featured = false } }) => {
    let projects = allProjects
      .filter((p) => p.type === type && (featured ? p.featured : true))
      .sort((a, b) => (a.date > b.date ? -1 : 1))
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        stack: p.stack,
        featured: p.featured,
      }));

    return renderServerComponent(
      projects.map((project) => (
        <div key={project.slug} className="h-full">
          <ProjectCard
            slug={project.slug}
            title={project.title}
            description={project.description}
            stack={project.stack}
          />
        </div>
      )),
    );
  });
