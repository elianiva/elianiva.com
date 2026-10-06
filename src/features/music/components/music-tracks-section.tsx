import { cn } from "~/lib/utils";
import type { MusicData } from "../lib/types";
import { NowPlayingPanel } from "./now-playing-panel";
import { TrackCard } from "./track-card";

export function MusicTracksSection({ data }: { data: MusicData }) {
  const nowPlaying = data.tracks.find((t) => t.nowPlaying);
  const history = data.tracks.filter((t) => !t.nowPlaying);
  const isLive = nowPlaying !== undefined;

  return (
    <section className="py-4 md:py-8">
      {nowPlaying && <NowPlayingPanel track={nowPlaying} />}

      <div className="mt-6 flex gap-4 font-mono text-sm text-pink-950/40">
        <span>
          in feed · <b className="text-pink-800 font-normal">{data.tracks.length}</b>
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

      {history.length > 0 ? (
        <div className="mt-6 border-t border-pink-200/50">
          <div className="py-4 font-mono text-xs text-foreground/50 tracking-widest uppercase">
            history
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {history.map((t, i) => (
              <TrackCard key={`${t.url}-${t.ts ?? i}`} track={t} />
            ))}
          </div>
        </div>
      ) : (
        !nowPlaying && (
          <div className="mt-6 py-20 text-center border border-dashed border-pink-200/50">
            <p className="font-mono text-sm text-pink-950/40">
              no scrobbles yet. set LASTFM_API_KEY if running locally.
            </p>
          </div>
        )
      )}
    </section>
  );
}
