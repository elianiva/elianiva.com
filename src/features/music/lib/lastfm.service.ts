import { Context, Duration, Effect, Layer, Redacted } from "effect";
import { HttpClient, HttpClientResponse } from "effect/unstable/http";
import { KvCache } from "~/lib/cache";
import { LASTFM_API_KEY } from "~/lib/env";
import type {
  LastFmTrack,
  MusicData,
  MusicPageData,
  ProfileInfo,
  TopAlbumItem,
  TopArtistItem,
  TopTrackItem,
} from "./types";

const LASTFM_USER = "elianiva";
const API_BASE = "https://ws.audioscrobbler.com/2.0/";

const EMPTY_TRACKS: MusicData = { tracks: [], total: 0 };
const EMPTY_ARTISTS: { artists: TopArtistItem[]; total: number } = { artists: [], total: 0 };
const EMPTY_ALBUMS: { albums: TopAlbumItem[]; total: number } = { albums: [], total: 0 };
const EMPTY_TOP_TRACKS: { tracks: TopTrackItem[]; total: number } = { tracks: [], total: 0 };
const EMPTY_PAGE: MusicPageData = {
  tracks: [],
  total: 0,
  stats: { uniqueArtists: 0, uniqueAlbums: 0, totalTracks: 0 },
  topArtists: [],
  topAlbums: [],
  topTracks: [],
  topArtistsYear: [],
  topAlbumsYear: [],
  topTracksYear: [],
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
    "@attr"?: { total?: string };
  };
};

function normalizeTrack(
  track: NonNullable<NonNullable<LastFmResp["recenttracks"]>["track"]>[number],
): LastFmTrack | null {
  const artistName = track.artist?.name ?? track.artist?.["#text"] ?? "";
  const albumName = track.album?.name ?? track.album?.["#text"] ?? "";
  if (!track.name || !artistName) return null;
  const artSrc =
    track.image.find((i) => i.size === "extralarge") ?? track.image[track.image.length - 1];
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
    ts: track.date?.uts ? new Date(Number(track.date.uts) * 1000).toISOString() : null,
  };
}

function pickImage(images: Array<{ "#text": string; size: string }>): string | null {
  const src = images.find((i) => i.size === "extralarge") ?? images[images.length - 1];
  return src && src["#text"] ? src["#text"] : null;
}

export class LastFM extends Context.Service<
  LastFM,
  {
    readonly getRecentTracks: () => Effect.Effect<MusicData>;
    readonly getProfileInfo: () => Effect.Effect<ProfileInfo | null>;
    readonly getTopArtists: (
      period: string,
      limit: number,
    ) => Effect.Effect<{ artists: TopArtistItem[]; total: number }>;
    readonly getTopAlbums: (
      period: string,
      limit: number,
    ) => Effect.Effect<{ albums: TopAlbumItem[]; total: number }>;
    readonly getTopTracks: (
      period: string,
      limit: number,
    ) => Effect.Effect<{ tracks: TopTrackItem[]; total: number }>;
    readonly getAllMusicData: () => Effect.Effect<MusicPageData>;
  }
>()("LastFM") {
  static readonly layer = Layer.effect(
    LastFM,
    Effect.gen(function* () {
      const apiKey = Redacted.value(yield* LASTFM_API_KEY);

      // No credentials → every read degrades to empty data, decided once here.
      if (!apiKey) {
        return {
          getRecentTracks: () => Effect.succeed(EMPTY_TRACKS),
          getProfileInfo: () => Effect.succeed(null),
          getTopArtists: () => Effect.succeed(EMPTY_ARTISTS),
          getTopAlbums: () => Effect.succeed(EMPTY_ALBUMS),
          getTopTracks: () => Effect.succeed(EMPTY_TOP_TRACKS),
          getAllMusicData: () => Effect.succeed(EMPTY_PAGE),
        };
      }

      const client = yield* HttpClient.HttpClient;
      const cache = yield* KvCache;

      const apiUrl = (method: string, extra: Record<string, string | number> = {}) =>
        `${API_BASE}?method=${method}&user=${LASTFM_USER}&api_key=${apiKey}&format=json&` +
        new URLSearchParams(
          Object.entries(extra).map(([k, v]) => [k, String(v)] as [string, string]),
        ).toString();

      const fetchJson = Effect.fn("LastFM.fetchJson")(function* <R>(url: string) {
        const resp = yield* client.get(url, {
          headers: { "User-Agent": "elianiva.com" },
        });
        yield* HttpClientResponse.filterStatusOk(resp);
        return yield* resp.json as Effect.Effect<R & { error?: number; message?: string }>;
      });

      const getRecentTracks = Effect.fn("LastFM.getRecentTracks")(function* () {
        return yield* cache.getOrElse({
          key: "music:tracks",
          ttl: Duration.minutes(2),
          fallback: EMPTY_TRACKS,
          load: Effect.gen(function* () {
            const data = yield* fetchJson<LastFmResp>(
              apiUrl("user.getrecenttracks", { limit: 100, extended: 1 }),
            );
            if (data.error) return EMPTY_TRACKS;
            const raw = data.recenttracks?.track ?? [];
            const tracks = raw.reduce<LastFmTrack[]>((acc, t) => {
              const normalized = normalizeTrack(t);
              if (normalized) acc.push(normalized);
              return acc;
            }, []);
            const total = Number(data.recenttracks?.["@attr"]?.total ?? tracks.length);
            return { tracks, total };
          }),
        });
      });

      const getProfileInfo = Effect.fn("LastFM.getProfileInfo")(function* () {
        return yield* cache.getOrElse({
          key: "music:profile",
          ttl: Duration.hours(1),
          fallback: null,
          load: Effect.gen(function* () {
            const data = yield* fetchJson<{
              user?: {
                playcount: string;
                registered: { unixtime: string; "#text": number };
                country: string;
                realname: string;
                image: Array<{ "#text": string; size: string }>;
              };
            }>(apiUrl("user.getinfo"));
            if (data.error || !data.user) return null;
            const u = data.user;
            return {
              playcount: Number(u.playcount),
              registered: new Date(Number(u.registered.unixtime) * 1000).toISOString(),
              country: u.country,
              realname: u.realname,
              image: pickImage(u.image),
            };
          }),
        });
      });

      const getTopArtists = Effect.fn("LastFM.getTopArtists")(function* (
        period: string,
        limit: number,
      ) {
        return yield* cache.getOrElse({
          key: `music:top-artists:${period}:${limit}`,
          ttl: Duration.hours(1),
          fallback: EMPTY_ARTISTS,
          load: Effect.gen(function* () {
            const data = yield* fetchJson<{
              topartists?: {
                artist?: Array<{
                  name: string;
                  playcount: string;
                  url: string;
                  image: Array<{ "#text": string; size: string }>;
                }>;
                "@attr"?: { total?: string };
              };
            }>(apiUrl("user.gettopartists", { period, limit }));
            if (data.error || !data.topartists) return EMPTY_ARTISTS;
            const total = Number(data.topartists["@attr"]?.total ?? 0);
            const artists: TopArtistItem[] = (data.topartists.artist ?? []).map((a) => ({
              name: a.name,
              playcount: Number(a.playcount),
              url: a.url,
              image: pickImage(a.image),
            }));
            return { artists, total };
          }),
        });
      });

      const getTopAlbums = Effect.fn("LastFM.getTopAlbums")(function* (
        period: string,
        limit: number,
      ) {
        return yield* cache.getOrElse({
          key: `music:top-albums:${period}:${limit}`,
          ttl: Duration.hours(1),
          fallback: EMPTY_ALBUMS,
          load: Effect.gen(function* () {
            const data = yield* fetchJson<{
              topalbums?: {
                album?: Array<{
                  name: string;
                  artist: { name: string; url: string };
                  playcount: string;
                  url: string;
                  image: Array<{ "#text": string; size: string }>;
                }>;
                "@attr"?: { total?: string };
              };
            }>(apiUrl("user.gettopalbums", { period, limit }));
            if (data.error || !data.topalbums) return EMPTY_ALBUMS;
            const total = Number(data.topalbums["@attr"]?.total ?? 0);
            const albums: TopAlbumItem[] = (data.topalbums.album ?? []).map((a) => ({
              name: a.name,
              artist: a.artist.name,
              playcount: Number(a.playcount),
              url: a.url,
              image: pickImage(a.image),
            }));
            return { albums, total };
          }),
        });
      });

      const getTopTracks = Effect.fn("LastFM.getTopTracks")(function* (
        period: string,
        limit: number,
      ) {
        return yield* cache.getOrElse({
          key: `music:top-tracks:${period}:${limit}`,
          ttl: Duration.hours(1),
          fallback: EMPTY_TOP_TRACKS,
          load: Effect.gen(function* () {
            const data = yield* fetchJson<{
              toptracks?: {
                track?: Array<{
                  name: string;
                  artist: { name: string; url: string };
                  playcount: string;
                  url: string;
                  image: Array<{ "#text": string; size: string }>;
                }>;
                "@attr"?: { total?: string };
              };
            }>(apiUrl("user.gettoptracks", { period, limit }));
            if (data.error || !data.toptracks) return EMPTY_TOP_TRACKS;
            const total = Number(data.toptracks["@attr"]?.total ?? 0);
            const tracks: TopTrackItem[] = (data.toptracks.track ?? []).map((t) => ({
              name: t.name,
              artist: t.artist.name,
              playcount: Number(t.playcount),
              url: t.url,
              image: pickImage(t.image),
            }));
            return { tracks, total };
          }),
        });
      });

      const getAllMusicData = Effect.fn("LastFM.getAllMusicData")(function* () {
        const [
          recentTracks,
          profile,
          topArtistsAll,
          topAlbumsAll,
          topTracksAll,
          topArtistsYear,
          topAlbumsYear,
          topTracksYear,
        ] = yield* Effect.all([
          getRecentTracks(),
          getProfileInfo(),
          getTopArtists("overall", 5),
          getTopAlbums("overall", 5),
          getTopTracks("overall", 5),
          getTopArtists("12month", 5),
          getTopAlbums("12month", 5),
          getTopTracks("12month", 5),
        ]);

        return {
          tracks: recentTracks.tracks,
          total: recentTracks.total,
          stats: {
            uniqueArtists: topArtistsAll.total,
            uniqueAlbums: topAlbumsAll.total,
            totalTracks: profile?.playcount ?? 0,
          },
          topArtists: topArtistsAll.artists,
          topAlbums: topAlbumsAll.albums,
          topTracks: topTracksAll.tracks,
          topArtistsYear: topArtistsYear.artists,
          topAlbumsYear: topAlbumsYear.albums,
          topTracksYear: topTracksYear.tracks,
        };
      });

      return {
        getRecentTracks,
        getProfileInfo,
        getTopArtists,
        getTopAlbums,
        getTopTracks,
        getAllMusicData,
      };
    }),
  );
}
