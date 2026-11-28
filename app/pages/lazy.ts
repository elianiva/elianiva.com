import { Component } from "@effect/ui";

/**
 * Every page loads from a chunk of its own. The server waits for the chunk and
 * renders the page; the browser preloads the current route's chunk before it
 * hydrates (`app/entry.client.ts`), so the prerendered nodes are kept.
 */
export const Home = Component.lazy("Home", () => import("./Home.ts").then((m) => m.Home));
export const Music = Component.lazy("Music", () => import("./Music.ts").then((m) => m.Music));
export const Neighbours = Component.lazy("Neighbours", () =>
  import("./Neighbours.ts").then((m) => m.Neighbours),
);
export const Post = Component.lazy("Post", () => import("./Post.ts").then((m) => m.Post));
export const Posts = Component.lazy("Posts", () => import("./Posts.ts").then((m) => m.Posts));
export const Project = Component.lazy("Project", () =>
  import("./Project.ts").then((m) => m.Project),
);
export const Projects = Component.lazy("Projects", () =>
  import("./Projects.ts").then((m) => m.Projects),
);
export const Uses = Component.lazy("Uses", () => import("./Uses.ts").then((m) => m.Uses));
export const Work = Component.lazy("Work", () => import("./Work.ts").then((m) => m.Work));
