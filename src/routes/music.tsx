import { createFileRoute } from "@tanstack/react-router";
import { RscSection } from "~/components/rsc-section";
import { Heading } from "~/components/ui/heading";
import { MusicTopListsSkeleton, MusicTracksSkeleton } from "~/components/ui/page-skeleton";
import { getRecentTracksRsc, getTopListsRsc } from "~/features/music/lib/music";
import { seo, defaultOgImageUrl } from "~/lib/seo";

const LASTFM_PROFILE_URL = "https://www.last.fm/user/elianiva";

function MusicRoute() {
  return (
    <div className="mx-auto max-w-container pt-10 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <header className="relative with-box-underline pb-4 md:pb-8">
          <Heading level={1}>Music</Heading>
          <p className="text-pink-950/60 mt-4 leading-relaxed">
            These are just vibes, pure vibes. Scrobbled using{" "}
            <a
              href={LASTFM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 underline decoration-pink-200 hover:decoration-pink-400"
            >
              last.fm
            </a>
            .
          </p>
        </header>
        <RscSection
          queryKey={["music", "top-lists"]}
          queryFn={getTopListsRsc}
          fallback={<MusicTopListsSkeleton />}
          staleTime={1000 * 60 * 60}
        />
        <RscSection
          queryKey={["music", "recent-tracks"]}
          queryFn={getRecentTracksRsc}
          fallback={<MusicTracksSkeleton />}
          staleTime={1000 * 60 * 2}
        />
      </div>
    </div>
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
