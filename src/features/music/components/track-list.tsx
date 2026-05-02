import type { MusicData } from "../lib/lastfm";
import { NowPlayingPanel } from "./now-playing-panel";
import { TrackCard } from "./track-card";

export function TrackList({ data }: { data: MusicData }) {
  const nowPlaying = data.tracks.find((t) => t.nowPlaying);
  const history = data.tracks.filter((t) => !t.nowPlaying);

  return (
    <>
      {nowPlaying && <NowPlayingPanel track={nowPlaying} />}

      <section className="mt-6 border-t border-pink-200/50">
        <div className="py-4 font-mono text-xs text-foreground/50 tracking-widest uppercase">
          history
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {history.map((t, i) => (
            <TrackCard key={`${t.url}-${t.ts ?? i}`} track={t} />
          ))}
        </div>
      </section>
    </>
  );
}
