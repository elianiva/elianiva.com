import { useLoaderData } from "@tanstack/react-router";
import { Heading } from "~/components/ui/heading";
import { type MusicData, LASTFM_PROFILE_URL } from "../lib/lastfm";
import { TrackList } from "./track-list";
import { cn } from "~/lib/utils";
import { NotFound } from "~/components/not-found";

export function MusicPage() {
  const music = useLoaderData({ from: "/music" }) as MusicData | null;

  if (!music) {
    return (
      <NotFound
        path="music"
        label="Music"
        title="No scrobbles found"
        description="Failed to load recent tracks from Last.fm. Try again later."
        backTo={{ to: "/music", label: "Music" }}
      />
    );
  }

  const isLive = music.tracks.some((t) => t.nowPlaying);

  return (
    <div className="mx-auto max-w-container pt-10 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <header className="relative with-box-underline pb-8">
          <Heading
            level={1}
            right={music ? `${music.total.toLocaleString()} scrobbles` : undefined}
          >
            Music
          </Heading>
          <p className="text-pink-950/60 mt-4 leading-relaxed">
            My ears are in a committed relationship with these noises. Scrobbled using{" "}
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
          {music && (
            <div className="flex gap-4 mt-4 font-mono text-sm text-pink-950/40">
              <span>
                in feed · <b className="text-pink-800 font-normal">{music.tracks.length}</b>
              </span>
              <span>
                status ·{" "}
                <b
                  className={cn(
                    "text-foreground/50 font-normal animate-pulse",
                    isLive && "text-pink-500",
                  )}
                >
                  ● {isLive ? "live" : "offline"}
                </b>
              </span>
            </div>
          )}
        </header>
        {music.tracks.length > 0 ? (
          <TrackList data={music} />
        ) : (
          <div className="py-20 text-center border border-dashed border-pink-200/50 mt-8">
            <p className="font-mono text-sm text-pink-950/40">
              no scrobbles yet. set LASTFM_API_KEY if running locally.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
