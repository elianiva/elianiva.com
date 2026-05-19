import { Heading } from "~/components/ui/heading";
import { type MusicData, LASTFM_PROFILE_URL } from "../lib/lastfm";
import { TrackList } from "./track-list";
import { cn } from "~/lib/utils";

export function MusicPage({ music }: { music: MusicData | null }) {
  if (!music) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-container items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl border border-pink-200 bg-white/80 p-6 shadow-soft backdrop-blur-sm md:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-pink-400">
            404 / music
          </p>
          <h1 className="mt-3 text-3xl font-display text-pink-800 md:text-5xl">
            No scrobbles found
          </h1>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-pink-950/75 md:text-base">
            Failed to load recent tracks from Last.fm. Try again later.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/"
              className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100"
            >
              Home
            </a>
            <a
              href="/music"
              className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100"
            >
              Music
            </a>
          </div>
          <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-pink-300">
            Music
          </p>
        </div>
      </div>
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
