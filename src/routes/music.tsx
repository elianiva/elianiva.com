import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { getRecentTracks } from "~/features/music/lib/lastfm";
import { MusicPage } from "~/features/music/components/music-page";
import { seo } from "~/lib/seo";

const getMusicPage = createServerFn({ method: "GET" }).handler(async () => {
  const data = await getRecentTracks();
  if (!data) return null;
  return renderServerComponent(<MusicPage data={data} />);
});

export const Route = createFileRoute("/music")({
  component: MusicPageRoute,
  loader: () => getMusicPage(),
  head: () =>
    seo({
      title: "Music",
      description: "Recently played tracks via Last.fm",
    }),
});

function MusicPageRoute() {
  const page = Route.useLoaderData();
  if (!page) {
    return (
      <div className="mx-auto max-w-container pt-10 border-x border-pink-200/50 min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-pink-950/40">
          couldn&apos;t reach last.fm. try again later.
        </p>
      </div>
    );
  }
  return <>{page}</>;
}
