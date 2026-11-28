import { Schema } from "effect";

/**
 * The shapes of the Api Worker's Last.fm routes, as Schemas. They match
 * `src/features/music/lib/types.ts`, which the Worker keeps using.
 */

export const LastFmTrack = Schema.Struct({
  track: Schema.String,
  artist: Schema.String,
  album: Schema.String,
  url: Schema.String,
  artistUrl: Schema.String,
  art: Schema.NullOr(Schema.String),
  nowPlaying: Schema.Boolean,
  ts: Schema.NullOr(Schema.String),
});
export type LastFmTrack = typeof LastFmTrack.Type;

const TopArtistItem = Schema.Struct({
  name: Schema.String,
  playcount: Schema.Number,
  url: Schema.String,
  image: Schema.NullOr(Schema.String),
});
const TopAlbumItem = Schema.Struct({
  name: Schema.String,
  artist: Schema.String,
  playcount: Schema.Number,
  url: Schema.String,
  image: Schema.NullOr(Schema.String),
});
const TopTrackItem = TopAlbumItem;

export const MusicData = Schema.Struct({
  tracks: Schema.Array(LastFmTrack),
  total: Schema.Number,
});
export type MusicData = typeof MusicData.Type;

export const TopListsData = Schema.Struct({
  stats: Schema.Struct({
    uniqueArtists: Schema.Number,
    uniqueAlbums: Schema.Number,
    totalTracks: Schema.Number,
  }),
  topArtists: Schema.Array(TopArtistItem),
  topAlbums: Schema.Array(TopAlbumItem),
  topTracks: Schema.Array(TopTrackItem),
  topArtistsYear: Schema.Array(TopArtistItem),
  topAlbumsYear: Schema.Array(TopAlbumItem),
  topTracksYear: Schema.Array(TopTrackItem),
});
export type TopListsData = typeof TopListsData.Type;

export const emptyMusic: MusicData = { tracks: [], total: 0 };

/** What the Worker answers without a Last.fm key. No scrobbles hides the panels. */
export const emptyTopLists: TopListsData = {
  stats: { uniqueArtists: 0, uniqueAlbums: 0, totalTracks: 0 },
  topArtists: [],
  topAlbums: [],
  topTracks: [],
  topArtistsYear: [],
  topAlbumsYear: [],
  topTracksYear: [],
};
