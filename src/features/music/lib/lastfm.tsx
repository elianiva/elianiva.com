import { Effect } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { runApp } from "~/lib/effect";
import { LastFM } from "./lastfm.service";
import { MusicPage } from "~/features/music/components/music-page";

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

export const getMusicTracksRsc = createServerFn({ method: "GET" }).handler(async () => {
  const music = await runApp(
    Effect.gen(function* () {
      const svc = yield* LastFM;
      return yield* svc.getRecentTracks();
    }),
  );
  return renderServerComponent(<MusicPage music={music} />);
});
