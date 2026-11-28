import type { Project } from "virtual:content";

export type ProjectType = Project["type"];
export type ProjectDoc = Omit<Project, "cv">;

export type ProjectSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  stack: [string, string][];
  image?: string;
  featured: boolean;
};

export type ProjectNeighbour = { slug: string; title: string };

export type ProjectDetail = {
  project: ProjectSummary & { source: string; demo: string | null };
  prevProject: ProjectNeighbour | null;
  nextProject: ProjectNeighbour | null;
};

const byDateDesc = <T extends { date: string }>(a: T, b: T): number => b.date.localeCompare(a.date);

const toNeighbour = <T extends { slug: string; title: string }>(
  doc: T | undefined,
): ProjectNeighbour | null => (doc ? { slug: doc.slug, title: doc.title } : null);

const toSummary = (p: ProjectDoc): ProjectSummary => ({
  slug: p.slug,
  title: p.title,
  description: p.description,
  date: p.date,
  stack: p.stack,
  ...(p.image === undefined ? {} : { image: p.image }),
  featured: p.featured,
});

// Sort a copy: callers elsewhere iterate the shared collection array.
const sortedProjects = (projects: readonly ProjectDoc[]): ProjectDoc[] =>
  [...projects].sort(byDateDesc);

export const listProjects = (
  projects: readonly ProjectDoc[],
  options: { type?: ProjectType; featured?: boolean } = {},
): ProjectSummary[] =>
  sortedProjects(projects)
    .filter((p) => (options.type ? p.type === options.type : true))
    .filter((p) => (options.featured ? p.featured : true))
    .map(toSummary);

export const getProject = (projects: readonly ProjectDoc[], slug: string): ProjectDetail | null => {
  const sorted = sortedProjects(projects);
  const index = sorted.findIndex((p) => p.slug === slug);
  const project = sorted[index];
  if (!project) return null;
  return {
    project: { ...toSummary(project), source: project.source, demo: project.demo ?? null },
    prevProject: toNeighbour(sorted[index + 1]),
    nextProject: toNeighbour(sorted[index - 1]),
  };
};
