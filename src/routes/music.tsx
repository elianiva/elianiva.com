import { createFileRoute } from "@tanstack/react-router";
import { MusicPage } from "~/features/music";
import { seo } from "~/lib/seo";

export const Route = createFileRoute("/music")({
  component: MusicPage,
  head: () =>
    seo({
      title: "Music",
      description: "Recently played tracks via Last.fm",
    }),
});
