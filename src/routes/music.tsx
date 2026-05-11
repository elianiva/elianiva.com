import { createFileRoute } from "@tanstack/react-router";
import { getRecentTracks } from "~/features/music/lib/lastfm";
import { MusicPage } from "~/features/music/components/music-page";
import { seo, defaultOgImageUrl } from "~/lib/seo";
import { MusicPageSkeleton } from "~/components/ui/page-skeleton";

export const Route = createFileRoute("/music")({
  component: MusicPage,
  pendingComponent: MusicPageSkeleton,
  loader: () => getRecentTracks(),
  head: () =>
    seo({
      title: "Music",
      description: "Recently played tracks via Last.fm",
      ogImage: defaultOgImageUrl("Music", "Recently played tracks via Last.fm"),
    }),
});
