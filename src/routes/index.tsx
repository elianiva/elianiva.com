import { createFileRoute } from "@tanstack/react-router";
import { HomeGrid } from "~/features/home/components/home-grid";
import { getGitHubContributions } from "~/features/github/lib/github-server";
import { homeSeo } from "~/lib/seo";

export const Route = createFileRoute("/")({
  component: Home,
  // Everything on this page is prerendered, so crawlers and agents that do not
  // run JavaScript read it. The contributions heatmap is fetched once here at
  // build time (`GH_TOKEN` is set for `alchemy deploy`) and baked into the HTML.
  // The deploy workflow also runs daily to keep it fresh. `null` when the
  // fetch failed, so the cell says so instead of showing a zero.
  loader: async () => (await getGitHubContributions()) ?? null,
  staleTime: Infinity,
  head: () => homeSeo(),
});

function Home() {
  const contributions = Route.useLoaderData();
  return <HomeGrid contributions={contributions} />;
}
