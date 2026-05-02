import MusicIcon from "~icons/ph/music-note-duotone";
import { fmtRel } from "./fmt";
import type { LastFmTrack } from "../lib/lastfm";

export function TrackCard({ track }: { track: LastFmTrack }) {
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col border border-pink-200/50 bg-white/40 hover:bg-pink-50/40 group transition-colors no-underline overflow-hidden"
    >
      {track.art ? (
        <img
          src={track.art}
          alt=""
          className="w-full h-auto aspect-square object-cover border-b border-pink-200/50 bg-white"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-auto aspect-square flex items-center justify-center border-b border-pink-200/50 bg-pink-100/30">
          <MusicIcon className="size-24 text-pink-500/20" />
        </div>
      )}
      <div className="p-1.5 min-w-0">
        <div className="text-xs font-medium text-pink-950 truncate group-hover:text-pink-500 transition-colors leading-tight">
          {track.track}
        </div>
        <div className="text-[10px] text-pink-950/50 truncate leading-tight">{track.artist}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-pink-950/30 font-mono truncate max-w-[65%]">
            {track.album}
          </span>
          <span
            className="text-[10px] text-pink-950/30 font-mono shrink-0"
            suppressHydrationWarning
          >
            {fmtRel(track.ts)}
          </span>
        </div>
      </div>
    </a>
  );
}
