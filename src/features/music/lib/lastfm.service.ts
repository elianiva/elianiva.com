import { Context, Duration, Effect, Layer, Redacted } from "effect";
import { HttpClient, HttpClientResponse } from "effect/unstable/http";
import { KvCache } from "~/lib/cache";
import { LASTFM_API_KEY } from "~/lib/env";

const LASTFM_USER = "elianiva";

type LastFmTrack = {
  track: string;
  artist: string;
  album: string;
  url: string;
  artistUrl: string;
  art: string | null;
  nowPlaying: boolean;
  ts: string | null;
};

type ProfileInfo = {
  playcount: number;
  registered: string;
  country: string;
  realname: string;
  image: string | null;
};

type TopArtistItem = {
  name: string;
  playcount: number;
  url: string;
  image: string | null;
};

type TopAlbumItem = {
  name: string;
  artist: string;
  playcount: number;
  url: string;
  image: string | null;
};

type TopTrackItem = {
  name: string;
  artist: string;
  playcount: number;
  url: string;
  image: string | null;
};

type MusicPageData = {
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

type MusicData = {
  tracks: LastFmTrack[];
  total: number;
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
      const apiKeyRedacted = yield* LASTFM_API_KEY;
      const apiKey = Redacted.value(apiKeyRedacted);
      const client = yield* HttpClient.HttpClient;
      const cache = yield* KvCache;

      const fetchJson = Effect.fn("LastFM.fetchJson")(function* <R>(url: string) {
        const resp = yield* client.get(url, {
          headers: { "User-Agent": "elianiva.com" },
        });
        yield* HttpClientResponse.filterStatusOk(resp);
        return yield* resp.json as Effect.Effect<R & { error?: number; message?: string }>;
      });

      const getRecentTracks = Effect.fn("LastFM.getRecentTracks")(function* () {
        if (!apiKey) return { tracks: [], total: 0 };
        const result = yield* cache
          .getOrSet(
            "music:tracks",
            Duration.minutes(2),
            Effect.gen(function* () {
              const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${apiKey}&format=json&limit=100&extended=1`;
              const data = yield* fetchJson<LastFmResp>(url);
              if (data.error) return { tracks: [], total: 0 };
              const raw = data.recenttracks?.track ?? [];
              const tracks = raw.reduce<LastFmTrack[]>((acc, t) => {
                const normalized = normalizeTrack(t);
                if (normalized) acc.push(normalized);
                return acc;
              }, []);
              const total = Number(data.recenttracks?.["@attr"]?.total ?? tracks.length);
              return { tracks, total };
            }),
          )
          .pipe(
            Effect.catchTag("KvCacheError", () => Effect.succeed({ tracks: [], total: 0 })),
            Effect.catchTag("HttpClientError", () => Effect.succeed({ tracks: [], total: 0 })),
          );
        return result;
      });

      const getProfileInfo = Effect.fn("LastFM.getProfileInfo")(function* () {
        if (!apiKey) return null;
        return yield* cache
          .getOrSet(
            "music:profile",
            Duration.hours(1),
            Effect.gen(function* () {
              const url = `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${LASTFM_USER}&api_key=${apiKey}&format=json`;
              const data = yield* fetchJson<{ user?: { playcount: string; registered: { unixtime: string; "#text": number }; country: string; realname: string; image: Array<{ "#text": string; size: string }> } }>(url);
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
          )
          .pipe(
            Effect.catchTag("KvCacheError", () => Effect.succeed(null)),
            Effect.catchTag("HttpClientError", () => Effect.succeed(null)),
          );
      });

      const getTopArtists = Effect.fn("LastFM.getTopArtists")(function* (
        period: string,
        limit: number,
      ) {
        if (!apiKey) return { artists: [], total: 0 };
        return yield* cache
          .getOrSet(
            `music:top-artists:${period}:${limit}`,
            Duration.hours(1),
            Effect.gen(function* () {
              const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${LASTFM_USER}&api_key=${apiKey}&format=json&period=${period}&limit=${limit}`;
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
              }>(url);
              if (data.error || !data.topartists) return { artists: [], total: 0 };
              const total = Number(data.topartists["@attr"]?.total ?? 0);
              const artists: TopArtistItem[] = (data.topartists.artist ?? []).map((a) => ({
                name: a.name,
                playcount: Number(a.playcount),
                url: a.url,
                image: pickImage(a.image),
              }));
              return { artists, total };
            }),
          )
          .pipe(
            Effect.catchTag("KvCacheError", () => Effect.succeed({ artists: [], total: 0 })),
            Effect.catchTag("HttpClientError", () => Effect.succeed({ artists: [], total: 0 })),
          );
      });

      const getTopAlbums = Effect.fn("LastFM.getTopAlbums")(function* (
        period: string,
        limit: number,
      ) {
        if (!apiKey) return { albums: [], total: 0 };
        return yield* cache
          .getOrSet(
            `music:top-albums:${period}:${limit}`,
            Duration.hours(1),
            Effect.gen(function* () {
              const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${LASTFM_USER}&api_key=${apiKey}&format=json&period=${period}&limit=${limit}`;
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
              }>(url);
              if (data.error || !data.topalbums) return { albums: [], total: 0 };
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
          )
          .pipe(
            Effect.catchTag("KvCacheError", () => Effect.succeed({ albums: [], total: 0 })),
            Effect.catchTag("HttpClientError", () => Effect.succeed({ albums: [], total: 0 })),
          );
      });

      const getTopTracks = Effect.fn("LastFM.getTopTracks")(function* (
        period: string,
        limit: number,
      ) {
        if (!apiKey) return { tracks: [], total: 0 };
        return yield* cache
          .getOrSet(
            `music:top-tracks:${period}:${limit}`,
            Duration.hours(1),
            Effect.gen(function* () {
              const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${LASTFM_USER}&api_key=${apiKey}&format=json&period=${period}&limit=${limit}`;
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
              }>(url);
              if (data.error || !data.toptracks) return { tracks: [], total: 0 };
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
          )
          .pipe(
            Effect.catchTag("KvCacheError", () => Effect.succeed({ tracks: [], total: 0 })),
            Effect.catchTag("HttpClientError", () => Effect.succeed({ tracks: [], total: 0 })),
          );
      });

      const getAllMusicData = Effect.fn("LastFM.getAllMusicData")(function* () {
        if (!apiKey)
          return {
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

        const [recentTracks, profile, topArtistsAll, topAlbumsAll, topTracksAll, topArtistsYear, topAlbumsYear, topTracksYear] =
          yield* Effect.all([
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

      return { getRecentTracks, getProfileInfo, getTopArtists, getTopAlbums, getTopTracks, getAllMusicData };
    }),
  );
}
