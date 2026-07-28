"use client";

import { useState } from "react";
import { Heading } from "~/components/ui/heading";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "~/components/ui/table";
import type { TopArtistItem, TopAlbumItem, TopTrackItem } from "../lib/types";

function fmtPlaycount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

type TopItem = { name: string; artist?: string; playcount: number; url: string };

function TopTable({
  label,
  items,
}: {
  label: string;
  items: TopItem[];
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <Heading level={3} className="mb-3">
        {label}
      </Heading>
      <Table className="font-mono text-sm table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="text-[10px] text-pink-950/40 uppercase tracking-widest font-normal w-8">
              #
            </TableHead>
            <TableHead className="text-[10px] text-pink-950/40 uppercase tracking-widest font-normal">
              name
            </TableHead>
            <TableHead className="text-[10px] text-pink-950/40 uppercase tracking-widest font-normal text-right w-16">
              plays
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, i) => (
            <TableRow key={item.name}>
              <TableCell className="text-pink-950/30">{i + 1}</TableCell>
              <TableCell className="truncate">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline text-pink-500 hover:text-pink-800 transition-colors truncate"
                >
                  {item.name}
                </a>
                {item.artist && (
                  <span className="text-pink-950/40 ml-1.5 shrink-0">· {item.artist}</span>
                )}
              </TableCell>
              <TableCell className="text-pink-950/40 text-right">
                {fmtPlaycount(item.playcount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TopGrid({
  topArtists,
  topAlbums,
  topTracks,
}: {
  topArtists: TopArtistItem[];
  topAlbums: TopAlbumItem[];
  topTracks: TopTrackItem[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TopTable label="Artists" items={topArtists} />
      <TopTable label="Albums" items={topAlbums.map((a) => ({ name: a.name, artist: a.artist, playcount: a.playcount, url: a.url }))} />
      <TopTable label="Tracks" items={topTracks.map((t) => ({ name: t.name, artist: t.artist, playcount: t.playcount, url: t.url }))} />
    </div>
  );
}

const periodTabs = ["overall", "last year"] as const;
type Period = (typeof periodTabs)[number];

export function TopListsRow({
  topArtists,
  topAlbums,
  topTracks,
  topArtistsYear,
  topAlbumsYear,
  topTracksYear,
}: {
  topArtists: TopArtistItem[];
  topAlbums: TopAlbumItem[];
  topTracks: TopTrackItem[];
  topArtistsYear: TopArtistItem[];
  topAlbumsYear: TopAlbumItem[];
  topTracksYear: TopTrackItem[];
}) {
  const [period, setPeriod] = useState<Period>("last year");

  const hasData = topArtists.length > 0 || topAlbums.length > 0 || topTracks.length > 0 ||
    topArtistsYear.length > 0 || topAlbumsYear.length > 0 || topTracksYear.length > 0;
  if (!hasData) return null;

  const artists = period === "overall" ? topArtists : topArtistsYear;
  const albums = period === "overall" ? topAlbums : topAlbumsYear;
  const tracks = period === "overall" ? topTracks : topTracksYear;

  return (
    <section className="py-4 md:py-8 relative with-box-underline">
      <div className="flex gap-4 mb-6">
        {periodTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setPeriod(tab)}
            className={`text-xs uppercase tracking-wider transition-colors ${
              period === tab
                ? "text-pink-800 font-medium border-b-2 border-pink-800"
                : "text-pink-950/30 hover:text-pink-950/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <TopGrid topArtists={artists} topAlbums={albums} topTracks={tracks} />
    </section>
  );
}
