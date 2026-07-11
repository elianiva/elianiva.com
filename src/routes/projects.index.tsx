import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPage } from "~/features/projects/components/projects-page";
import { seo, defaultOgImageUrl } from "~/lib/seo";

export const Route = createFileRoute("/projects/")({
  component: ProjectsPage,
  head: () =>
    seo({
      title: "Projects",
      description: "Things I've built",
      ogImage: defaultOgImageUrl("Projects", "Things I've built"),
      path: "/projects",
    }),
});
