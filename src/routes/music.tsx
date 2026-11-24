import { Suspense, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Box, Cell, Fill, LABEL, PageHead, type Tone } from "~/components/box";
import { getRecentTracks, getTopListsData } from "~/features/music/lib/music-server";
import type { LastFmTrack, TopListsData } from "~/features/music/lib/types";
import { fmtRel } from "~/lib/fmt";
import { cn } from "~/lib/utils";
import { seo, ogPageImageUrl } from "~/lib/seo";

const LASTFM_PROFILE_URL = "https://www.last.fm/user/elianiva";
const PERIODS = ["last year", "overall"] as const;
type Period = (typeof PERIODS)[number];

function fmtPlays(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

type TopItem = { name: string; artist?: string; playcount: number; url: string };

function TopCell({ label, items, tone }: { label: string; items: TopItem[]; tone: Tone }) {
  const max = Math.max(1, ...items.map((i) => i.playcount));
  return (
    <Cell tone={tone} label={label}>
      <ol className="mt-auto grid gap-2">
        {items.slice(0, 5).map((item, i) => (
          <li key={item.name} className="min-w-0">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-baseline justify-between gap-2 text-sm hover:text-pink-600"
            >
              <span className="min-w-0 truncate text-pink-950">
                <span className="mr-1.5 font-mono text-[10px] text-pink-500">{i + 1}</span>
                {item.name}
              </span>
              <span className="shrink-0 font-mono text-[10px] text-pink-950/55">
                {fmtPlays(item.playcount)}
              </span>
            </a>
            <span
              aria-hidden
              className="mt-0.5 block h-1 bg-pink-400/60"
              style={{ width: `${(item.playcount / max) * 100}%` }}
            />
          </li>
        ))}
      </ol>
    </Cell>
  );
}

function TopLists({ data }: { data: TopListsData }) {
  const [period, setPeriod] = useState<Period>("last year");
  const year = period === "last year";
  const artists = year ? data.topArtistsYear : data.topArtists;
  const albums = year ? data.topAlbumsYear : data.topAlbums;
  const tracks = year ? data.topTracksYear : data.topTracks;

  return (
    <>
      <Cell tone="white" label="Charts" className="justify-between">
        <div role="radiogroup" aria-label="Period" className="flex flex-col items-start gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={period === p}
              onClick={() => setPeriod(p)}
              className={cn(
                "border px-2 py-1 font-mono text-[11px] tracking-wider uppercase transition-[color,background-color,border-color,box-shadow,transform,translate,rotate,scale] active:scale-[0.97]",
                period === p
                  ? "-rotate-3 border-pink-600 bg-pink-600 text-white"
                  : "border-pink-200 text-pink-700 hover:-translate-y-0.5 hover:bg-white",
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <dl className="grid grid-cols-2 gap-y-1 font-mono text-[11px] text-pink-950/65">
          <dt>artists</dt>
          <dd className="text-right text-pink-950">{data.stats.uniqueArtists.toLocaleString()}</dd>
          <dt>albums</dt>
          <dd className="text-right text-pink-950">{data.stats.uniqueAlbums.toLocaleString()}</dd>
        </dl>
      </Cell>
      <TopCell label="Top artists" items={artists} tone="yellow" />
      <TopCell
        label="Top albums"
        items={albums.map((a) => ({ ...a, artist: a.artist }))}
        tone="sky"
      />
      <TopCell label="Top tracks" items={tracks} tone="lilac" />
      <Fill used={4} />
    </>
  );
}

function MusicTopLists() {
  const { data } = useSuspenseQuery({
    queryKey: ["music", "top-lists"],
    queryFn: () => getTopListsData(),
    staleTime: 1000 * 60 * 60,
  });
  return <TopLists data={data} />;
}

/** One scrobble as a square sleeve: the cover fills the cell, the title sits on it. */
function Sleeve({ track, big }: { track: LastFmTrack; big?: boolean }) {
  return (
    <Cell span={big ? "s2" : "1"} tone="ink" className="overflow-hidden p-0 md:p-0">
      <a
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group/sleeve absolute inset-0 flex flex-col justify-end p-3 md:p-4"
      >
        {track.art && (
          <img
            src={track.art}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-300 ease-out"
          />
        )}
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-pink-950/85 via-transparent to-transparent"
        />
        {big && track.nowPlaying && (
          <span className="absolute top-4 left-4 flex items-center gap-2 bg-pink-600 px-2 py-1 font-mono text-[10px] tracking-widest text-white uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-white motion-reduce:animate-none" />
            Now playing
          </span>
        )}
        <span className="relative min-w-0">
          <span
            className={cn(
              "block truncate font-semibold text-white",
              big ? "font-display text-2xl" : "text-[13px]",
            )}
          >
            {track.track}
          </span>
          <span className="block truncate text-[11px] text-pink-50/80">
            {track.artist}
            {!track.nowPlaying && <span suppressHydrationWarning> · {fmtRel(track.ts)}</span>}
          </span>
        </span>
      </a>
    </Cell>
  );
}

function MusicRecentTracks() {
  const { data } = useSuspenseQuery({
    queryKey: ["music", "recent-tracks"],
    queryFn: () => getRecentTracks(),
    staleTime: 1000 * 60 * 2,
  });
  const [lead, ...rest] = data.tracks;
  if (!lead) {
    return (
      <Cell span="w4" tone="hatch" className="items-center justify-center text-center">
        <p className="font-mono text-sm text-pink-700">
          No scrobbles yet. Set LASTFM_API_KEY if running locally.
        </p>
      </Cell>
    );
  }
  // Covers fill the grid; tracks without one go to a plain text list after it.
  const covered = rest.filter((t) => t.art);
  const bare = rest.filter((t) => !t.art);

  return (
    <>
      <Sleeve track={lead} big />
      {covered.map((t, i) => (
        <Sleeve key={`${t.url}-${t.ts ?? i}`} track={t} />
      ))}
      {/* The big sleeve takes 2 columns over 2 rows: 4 cells of area. */}
      <Fill used={4 + covered.length} />
      {bare.length > 0 && (
        <Cell span="w4" label={`${bare.length} more without cover art`}>
          <ul className="columns-1 gap-8 md:columns-3">
            {bare.map((t, i) => (
              <li key={`${t.url}-${t.ts ?? i}`} className="break-inside-avoid py-1">
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm text-pink-950 hover:text-pink-600"
                >
                  {t.track}
                  <span className="text-pink-950/55"> · {t.artist}</span>
                </a>
              </li>
            ))}
          </ul>
        </Cell>
      )}
    </>
  );
}

function Loading({ span }: { span: "w4" }) {
  return (
    <Cell span={span} tone="hatch" className="items-center justify-center">
      <p className={LABEL}>Tuning in…</p>
    </Cell>
  );
}

function ScrobbleCount() {
  const { data } = useSuspenseQuery({
    queryKey: ["music", "top-lists"],
    queryFn: () => getTopListsData(),
    staleTime: 1000 * 60 * 60,
  });
  return <>{data.stats.totalTracks.toLocaleString()}</>;
}

function MusicRoute() {
  return (
    <Box>
      <PageHead
        title="Music"
        tone="pink"
        kicker={
          <>
            These are just vibes, pure vibes. Scrobbled using{" "}
            <a
              href={LASTFM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 underline decoration-pink-300 underline-offset-4 hover:decoration-pink-500"
            >
              last.fm
            </a>
            .
          </>
        }
        aside={
          <>
            <p className="mt-auto font-display text-5xl leading-none font-extrabold text-pink-950 tabular-nums">
              <Suspense fallback="…">
                <ScrobbleCount />
              </Suspense>
            </p>
            <p className="font-mono text-[11px] text-pink-950/60">scrobbles so far</p>
          </>
        }
      />
      <Suspense fallback={<Loading span="w4" />}>
        <MusicTopLists />
      </Suspense>
      <Suspense fallback={<Loading span="w4" />}>
        <MusicRecentTracks />
      </Suspense>
    </Box>
  );
}

export const Route = createFileRoute("/music")({
  // Same reason as the home route: Last.fm reads a secret-backed server
  // function with no key at build time, so prerendering would bake in the
  // empty fallback. Skip SSR and fetch live in the browser instead.
  ssr: false,
  head: () =>
    seo({
      title: "Music",
      description: "Recently played tracks via Last.fm",
      ogImage: ogPageImageUrl("music"),
      path: "/music",
    }),
  component: MusicRoute,
});
