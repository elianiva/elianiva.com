import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allProjects } from "content-collections";
import { getProject, listProjects, type ProjectType } from "~/features/content/lib/projects";

import { ProjectCard } from "../components/project-card";

export const getProjects = createServerFn({ method: "GET" })
  .validator((input: { type: ProjectType; featured?: boolean }) => input)
  .handler(async ({ data: { type, featured = false } }) => {
    const projects = listProjects(allProjects, { type, featured });
    return renderServerComponent(
      projects.map((project) => (
        <ProjectCard
          key={project.slug}
          slug={project.slug}
          title={project.title}
          description={project.description}
          stack={project.stack}
        />
      )),
    );
  });

export const getProjectBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const detail = getProject(allProjects, slug);
    if (!detail) throw notFound();

    return {
      ...detail.project,
      prevProject: detail.prevProject,
      nextProject: detail.nextProject,
      mdx: await renderServerComponent(<detail.mdx />),
    };
  });
