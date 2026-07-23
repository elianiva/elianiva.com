import { createFileRoute } from "@tanstack/react-router";
import { RscSection } from "~/components/rsc-section";
import { getMusicTracksRsc } from "~/features/music/lib/lastfm";
import { MusicPageSkeleton } from "~/components/ui/page-skeleton";
import { seo, defaultOgImageUrl } from "~/lib/seo";

function MusicRoute() {
  return (
    <RscSection
      queryKey={["recent-tracks"]}
      queryFn={getMusicTracksRsc}
      fallback={<MusicPageSkeleton />}
    />
  );
}

export const Route = createFileRoute("/music")({
  head: () =>
    seo({
      title: "Music",
      description: "Recently played tracks via Last.fm",
      ogImage: defaultOgImageUrl("Music", "Recently played tracks via Last.fm"),
      path: "/music",
    }),
  component: MusicRoute,
});
