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

export type ProfileInfo = {
  playcount: number;
  registered: string;
  country: string;
  realname: string;
  image: string | null;
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

export type MusicData = {
  tracks: LastFmTrack[];
  total: number;
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
