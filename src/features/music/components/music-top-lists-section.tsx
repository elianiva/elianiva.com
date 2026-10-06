import type { TopListsData } from "../lib/types";
import { StatsRow } from "./stats-row";
import { TopListsRow } from "./top-lists-row";

export function MusicTopListsSection({ data }: { data: TopListsData }) {
  return (
    <>
      <StatsRow stats={data.stats} />
      <TopListsRow
        topArtists={data.topArtists}
        topAlbums={data.topAlbums}
        topTracks={data.topTracks}
        topArtistsYear={data.topArtistsYear}
        topAlbumsYear={data.topAlbumsYear}
        topTracksYear={data.topTracksYear}
      />
    </>
  );
}
