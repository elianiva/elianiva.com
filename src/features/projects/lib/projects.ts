import { allProjects } from "content-collections";
import { getProject, listProjects } from "~/features/content/lib/projects";
import type { ProjectType } from "~/features/content/lib/projects";

/**
 * Client reads over the bundled content collection. Projects ship in the JS
 * bundle, so these are synchronous — no fetcher, no server round-trip.
 */
export function getProjects(options?: { type?: ProjectType; featured?: boolean }) {
  return listProjects(allProjects, options);
}

export function getProjectBySlug(slug: string) {
  return getProject(allProjects, slug);
}
