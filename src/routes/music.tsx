import { createFileRoute } from "@tanstack/react-router";
import { MusicSection } from "~/features/music/components/music-section";
import { seo, defaultOgImageUrl } from "~/lib/seo";

export const Route = createFileRoute("/music")({
  component: MusicSection,
  head: () =>
    seo({
      title: "Music",
      description: "Recently played tracks via Last.fm",
      ogImage: defaultOgImageUrl("Music", "Recently played tracks via Last.fm"),
    }),
});
