import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allProjects } from "content-collections";
import { z } from "zod";
import { getProject, listProjects } from "~/features/content/lib/projects";

import { ProjectCard } from "../components/project-card";

export const getProjects = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z
      .object({
        type: z.enum(["personal", "open-source", "assignment"]).optional(),
        featured: z.boolean().optional(),
      })
      .parse(data),
  )
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
  .validator((data: unknown) => z.string().min(1).parse(data))
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
