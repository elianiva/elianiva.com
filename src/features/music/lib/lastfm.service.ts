import { Config, Context, Duration, Effect, Layer, Redacted } from "effect"
import { HttpClient, HttpClientResponse } from "effect/unstable/http"
import { KvCache } from "~/lib/cache"

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

export class LastFM extends Context.Service<LastFM, {
  readonly getRecentTracks: () => Effect.Effect<MusicData>
}>()("LastFM") {
  static readonly layer = Layer.effect(
    LastFM,
    Effect.gen(function*() {
      const apiKey = Redacted.value(yield* Config.redacted("LASTFM_API_KEY").pipe(Config.withDefault(Redacted.make(""))))
      const client = yield* HttpClient.HttpClient
      const cache = yield* KvCache

      const getRecentTracks = Effect.fn("LastFM.getRecentTracks")(function*() {
        if (!apiKey) return { tracks: [], total: 0 }

        const result = yield* cache.getOrSet("music:tracks", Duration.seconds(20),
          Effect.gen(function*() {
            const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${apiKey}&format=json&limit=100&extended=1`
            const resp = yield* client.get(url, {
              headers: { "User-Agent": "elianiva.com" },
            })
            yield* HttpClientResponse.filterStatusOk(resp)
            const data = yield* resp.json as Effect.Effect<
              LastFmResp & { recenttracks?: { "@attr"?: { total?: string } }; error?: number; message?: string }
            >
            if (data.error) return { tracks: [], total: 0 }
            const raw = data.recenttracks?.track ?? []
            const tracks = raw.reduce<LastFmTrack[]>((acc, t) => {
              const normalized = normalizeTrack(t);
              if (normalized) acc.push(normalized);
              return acc;
            }, [])
            const total = Number(data.recenttracks?.["@attr"]?.total ?? tracks.length)
            return { tracks, total }
          }),
        ).pipe(
          Effect.catchTag("KvCacheError", () => Effect.succeed({ tracks: [], total: 0 })),
          Effect.catchTag("HttpClientError", () => Effect.succeed({ tracks: [], total: 0 })),
        )
        return result
      })

      return { getRecentTracks }
    }),
  )
}
