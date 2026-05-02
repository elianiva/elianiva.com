import { createFileRoute } from "@tanstack/react-router";
import { getRecentTracks } from "~/features/music/lib/lastfm";
import { MusicPage } from "~/features/music/components/music-page";
import { seo } from "~/lib/seo";

export const Route = createFileRoute("/music")({
  component: MusicPage,
  loader: () => getRecentTracks(),
  head: () =>
    seo({
      title: "Music",
      description: "Recently played tracks via Last.fm",
    }),
});
