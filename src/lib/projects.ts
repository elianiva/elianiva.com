import { createServerFn } from "@tanstack/react-start";
import { allProjects } from "content-collections";

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
  .handler(async ({ data: { type, featured = false } }): Promise<ProjectSummary[]> => {
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

    return featured ? projects.filter((p) => p.featured) : projects;
  });
