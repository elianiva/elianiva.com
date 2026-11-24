import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPage } from "~/features/projects/components/projects-page";
import { fetchProjectActivity } from "~/features/projects/lib/activity-server";
import { seo, ogPageImageUrl } from "~/lib/seo";

export const Route = createFileRoute("/projects/")({
  component: Projects,
  // Read at build time like the home heatmap: the daily deploy keeps the order fresh.
  loader: async () => {
    try {
      return await fetchProjectActivity();
    } catch {
      return {};
    }
  },
  staleTime: Infinity,
  head: () =>
    seo({
      title: "Projects",
      description: "Things I've built",
      ogImage: ogPageImageUrl("projects"),
      path: "/projects",
    }),
});

function Projects() {
  return <ProjectsPage activity={Route.useLoaderData()} />;
}
