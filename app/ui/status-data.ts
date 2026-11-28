import { allPosts, allProjects } from "virtual:content";
import { currentRoles } from "../data/work-experience";
import { listPosts } from "../lib/posts";
import { listProjects } from "../lib/projects";
import type { StatusBoardData } from "./based-row";

/**
 * The rows of the status board that never change after the build. They are
 * computed here, on the server, and handed to the island as props, so the
 * island's chunk does not carry the content index they come from.
 */
export const statusBoardData = (): StatusBoardData => {
  const role = currentRoles()[0];
  const post = listPosts(allPosts, { limit: 1 })[0];
  const project = listProjects(allProjects)[0];
  return {
    role: role
      ? {
          company: role.company,
          href: role.website?.href ?? null,
          position: role.position,
          time: role.time,
        }
      : null,
    post: post ? { slug: post.slug, title: post.title, date: post.date } : null,
    project: project
      ? {
          slug: project.slug,
          title: project.title,
          description: project.description,
          date: project.date,
        }
      : null,
  };
};
