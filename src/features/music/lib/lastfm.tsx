import { Effect } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { runtime } from "~/lib/effect";
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

export type TopArtistItem = {
  name: string;
  playcount: number;
  url: string;
  image: string | null;
};

export type TopAlbumItem = {
  name: string;
  artist: string;
  playcount: number;
  url: string;
  image: string | null;
};

export type TopTrackItem = {
  name: string;
  artist: string;
  playcount: number;
  url: string;
  image: string | null;
};

export type MusicPageData = {
  tracks: LastFmTrack[];
  total: number;
  stats: {
    uniqueArtists: number;
    uniqueAlbums: number;
    totalTracks: number;
  };
  topArtists: TopArtistItem[];
  topAlbums: TopAlbumItem[];
  topTracks: TopTrackItem[];
  topArtistsYear: TopArtistItem[];
  topAlbumsYear: TopAlbumItem[];
  topTracksYear: TopTrackItem[];
};

export const getMusicTracksRsc = createServerFn({ method: "GET" }).handler(async () => {
  const music = await runtime.runPromise(
    Effect.gen(function* () {
      const svc = yield* LastFM;
      return yield* svc.getAllMusicData();
    }),
  );
  return renderServerComponent(<MusicPage music={music} />);
});
