import type { MDXContent } from "mdx/types";
import { byDateDesc, toNeighbour } from "./shared";

export type ProjectDoc = {
  slug: string;
  title: string;
  description: string;
  date: string;
  featured: boolean;
  type: ProjectType;
  source: string;
  demo?: string | null;
  stack: string[][];
  image?: string;
  mdx: MDXContent;
};

export type ProjectType = "personal" | "open-source" | "assignment";

export type ProjectSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  stack: string[][];
  image?: string;
  featured: boolean;
};

export type ProjectNeighbour = { slug: string; title: string };

export type ProjectDetail = {
  project: ProjectSummary & { source: string; demo: string | null };
  mdx: MDXContent;
  prevProject: ProjectNeighbour | null;
  nextProject: ProjectNeighbour | null;
};

function toSummary(p: ProjectDoc): ProjectSummary {
  return {
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.date,
    stack: p.stack,
    image: p.image,
    featured: p.featured,
  };
}

// Sort a copy: callers elsewhere iterate the shared collection array.
function sortedProjects(projects: ProjectDoc[]): ProjectDoc[] {
  return [...projects].sort(byDateDesc);
}

export function listProjects(
  projects: ProjectDoc[],
  options: { type?: ProjectType; featured?: boolean } = {},
): ProjectSummary[] {
  return sortedProjects(projects)
    .filter((p) => (options.type ? p.type === options.type : true))
    .filter((p) => (options.featured ? p.featured : true))
    .map(toSummary);
}

export function getProject(projects: ProjectDoc[], slug: string): ProjectDetail | null {
  const sorted = sortedProjects(projects);
  const index = sorted.findIndex((p) => p.slug === slug);
  if (index === -1) return null;

  const project = sorted[index];
  return {
    project: { ...toSummary(project), source: project.source, demo: project.demo ?? null },
    mdx: project.mdx,
    prevProject: toNeighbour(sorted[index + 1]),
    nextProject: toNeighbour(sorted[index - 1]),
  };
}
