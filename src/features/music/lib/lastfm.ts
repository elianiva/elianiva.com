import { createServerFn } from "@tanstack/react-start";
import { cached, TTL } from "~/lib/cache";

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

type LastFmResp = {
  recenttracks?: {
    track?: Array<{
      name: string;
      artist: { name?: string; "#text"?: string; url?: string };
      album: { name?: string; "#text"?: string };
      url: string;
      image: Array<{ "#text": string; size: string }>;
      "@attr"?: { nowplaying?: string };
      date?: { uts: string };
    }>;
  };
};

function normalizeTrack(
  track: NonNullable<NonNullable<LastFmResp["recenttracks"]>["track"]>[number],
): LastFmTrack | null {
  const artistName = track.artist?.name ?? track.artist?.["#text"] ?? "";
  const albumName = track.album?.name ?? track.album?.["#text"] ?? "";
  if (!track.name || !artistName) return null;
  const artSrc =
    track.image.find((i) => i.size === "extralarge") ??
    track.image[track.image.length - 1];
  const artistUrl =
    track.artist?.url ??
    `https://www.last.fm/music/${encodeURIComponent(artistName.replace(/ /g, "+"))}`;
  return {
    track: track.name,
    artist: artistName,
    album: albumName,
    url: track.url,
    artistUrl,
    art: artSrc && artSrc["#text"] ? artSrc["#text"] : null,
    nowPlaying: track["@attr"]?.nowplaying === "true",
    ts: track.date?.uts
      ? new Date(Number(track.date.uts) * 1000).toISOString()
      : null,
  };
}

export type MusicData = {
  tracks: LastFmTrack[];
  total: number;
};

export const getRecentTracks = createServerFn({ method: "GET" }).handler(
  (): Promise<MusicData> =>
    cached("music:tracks", TTL.live, async (): Promise<MusicData> => {
      const key = process.env.LASTFM_API_KEY;
      if (!key) {
        console.error("lastfm: LASTFM_API_KEY not set");
        return { tracks: [], total: 0 };
      }
      const url =
        `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${key}&format=json&limit=100&extended=1`;
      const res = await fetch(url, {
        headers: { "User-Agent": "elianiva.com" },
      });
      if (!res.ok) {
        console.error(`lastfm http: ${res.status}`);
        return { tracks: [], total: 0 };
      }
      const data = (await res.json()) as LastFmResp & {
        recenttracks?: { "@attr"?: { total?: string } };
        error?: number;
        message?: string;
      };
      if (data.error) {
        console.error(`lastfm api error ${data.error}: ${data.message}`);
        return { tracks: [], total: 0 };
      }
      const raw = data.recenttracks?.track ?? [];
      const tracks = raw
        .map(normalizeTrack)
        .filter((t): t is LastFmTrack => t != null);
      const total = Number(data.recenttracks?.["@attr"]?.total ?? tracks.length);
      return { tracks, total };
    }).catch((err) => {
      console.error("music:tracks error:", err);
      return { tracks: [], total: 0 };
    }),
);
