import MusicIcon from "~icons/ph/music-note-duotone";
import type { LastFmTrack } from "../lib/lastfm";
import { Card } from "~/components/ui/card";

export function NowPlayingPanel({ track }: { track: LastFmTrack }) {
  return (
    <Card className="border border-pink-300/50 bg-pink-50/30 p-0 ring-0">
      <a
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center group no-underline"
      >
        <div className="min-w-0 space-y-2 flex-1 pl-4">
          <div className="flex items-center gap-2 mb-4 font-mono text-xs text-pink-500 uppercase tracking-widest">
            <span className="size-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899] animate-pulse" />
            now playing
          </div>
          <div className="leading-none text-xl font-semibold text-pink-950 truncate group-hover:text-pink-500 transition-colors">
            {track.track}
          </div>
          <div className="text-pink-950/60 leading-none">{track.artist}</div>
          {track.album && (
            <div className="leading-none text-sm text-pink-950/30">{track.album}</div>
          )}
        </div>
        {track.art ? (
          <img
            src={track.art}
            alt=""
            className="size-40 object-cover border-l border-pink-200 bg-white"
            width={160}
            height={160}
          />
        ) : (
          <div className="size-40 flex items-center justify-center border-l border-pink-200 bg-pink-100/50">
            <MusicIcon className="size-24 text-pink-500/20" />
          </div>
        )}
      </a>
    </Card>
  );
}
