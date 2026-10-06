import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPage } from "~/features/projects/components/projects-page";
import { seo, ogPageImageUrl } from "~/lib/seo";

export const Route = createFileRoute("/projects/")({
  component: ProjectsPage,
  head: () =>
    seo({
      title: "Projects",
      description: "Things I've built",
      ogImage: ogPageImageUrl("projects"),
      path: "/projects",
    }),
});
