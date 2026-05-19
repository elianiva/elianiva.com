import { Effect } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { AppRuntime } from "~/lib/effect";
import { LastFM } from "./lastfm.service";

const LASTFM_USER = "elianiva";

export const LASTFM_PROFILE_URL = `https://www.last.fm/user/${LASTFM_USER}`;

export type LastFmTrack = {
  track: string;
  artist: string;
  album: string;
  url: string;
  artistUrl: string;
  art: string | null;
  nowPlaying: boolean;
  ts: string | null;
};

export type MusicData = {
  tracks: LastFmTrack[];
  total: number;
};

export const getRecentTracks = createServerFn({ method: "GET" }).handler(() =>
  AppRuntime.runPromise(
    Effect.gen(function*() {
      const svc = yield* LastFM;
      return yield* svc.getRecentTracks();
    }),
  ),
);
