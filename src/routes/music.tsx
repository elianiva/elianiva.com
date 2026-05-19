import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { getRecentTracks } from "~/features/music/lib/lastfm";
import { MusicPage } from "~/features/music/components/music-page";
import { seo, defaultOgImageUrl } from "~/lib/seo";
import { MusicPageSkeleton } from "~/components/ui/page-skeleton";

const getMusicRsc = createServerFn({ method: "GET" }).handler(async () => {
  const music = await getRecentTracks();
  const Renderable = await renderServerComponent(<MusicPage music={music} />);
  return { Renderable };
});

export const Route = createFileRoute("/music")({
  component: MusicRoute,
  pendingComponent: MusicPageSkeleton,
  loader: async () => {
    const { Renderable } = await getMusicRsc();
    return { Content: Renderable };
  },
  head: () =>
    seo({
      title: "Music",
      description: "Recently played tracks via Last.fm",
      ogImage: defaultOgImageUrl("Music", "Recently played tracks via Last.fm"),
    }),
});

function MusicRoute() {
  const { Content } = Route.useLoaderData();
  return <>{Content}</>;
}
