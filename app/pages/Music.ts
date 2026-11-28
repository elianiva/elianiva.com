import { Component, UiSchema, View } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { AsyncResult } from "effect/reactivity";
import { css } from "../../styled-system/css";
import type { LastFmTrack, TopListsData } from "../features/music/types";
import { fmtRel } from "../lib/fmt";
import { ogPageImageUrl, seoHead } from "../lib/seo";
import { GetRecentTracks } from "../queries/GetRecentTracks";
import { GetTopLists } from "../queries/GetTopLists";
import { Box, Cell, label, type Style, type Tone } from "../ui/box";
import { Fill, PageHead } from "../ui/pagehead";

const LASTFM_PROFILE_URL = "https://www.last.fm/user/elianiva";
const PERIODS = ["last year", "overall"] as const;
const PeriodSchema = Schema.Literals(PERIODS);

const fmtPlays = (n: number): string => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const truncate: Style = {
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const textLink = css({
  color: "pink.600",
  textDecoration: "underline",
  textDecorationColor: "pink.300",
  textUnderlineOffset: "4px",
  _hover: { textDecorationColor: "pink.500" },
});

type TopItem = { name: string; playcount: number; url: string };

const TopCell = <M>(
  h: Html.H<M>,
  options: { label: string; items: ReadonlyArray<TopItem>; tone: Tone },
) => {
  const { items } = options;
  const max = Math.max(1, ...items.map((i) => i.playcount));
  return Cell(h, {
    tone: options.tone,
    label: View.text(options.label),
    children: [
      h.ol.class(css({ mt: "auto", display: "grid", gap: "2" })).children(
        items.slice(0, 5).map((item, i) =>
          h.li
            .key(`${item.name}-${i}`)
            .class(css({ minWidth: "0" }))
            .children(
              h.a
                .attrs({ href: item.url, ...ext })
                .class(
                  css({
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: "2",
                    fz: "sm",
                    _hover: { color: "pink.600" },
                  }),
                )
                .children(
                  h.span.class(css(truncate, { minWidth: "0", color: "pink.950" })).children(
                    h.span
                      .class(
                        css({
                          mr: "1.5",
                          fontFamily: "mono",
                          fontSize: "10px",
                          color: "pink.500",
                        }),
                      )
                      .children(String(i + 1)),
                    item.name,
                  ),
                  h.span
                    .class(
                      css({
                        flexShrink: "0",
                        fontFamily: "mono",
                        fontSize: "10px",
                        color: "pink.950/55",
                      }),
                    )
                    .children(fmtPlays(item.playcount)),
                ),
              h.span
                .attr("aria-hidden", "true")
                .class(css({ mt: "0.5", display: "block", height: "1", bg: "pink.400/60" }))
                .style({ width: `${(item.playcount / max) * 100}%` }),
            ),
        ),
      ),
    ],
  });
};

const MusicBodyMessage = UiSchema.TaggedEnum({ PickedPeriod: { period: PeriodSchema } });

const periodButton = (active: boolean): Style => ({
  borderWidth: "1px",
  px: "2",
  py: "1",
  fontFamily: "mono",
  fontSize: "11px",
  letterSpacing: "wider",
  textTransform: "uppercase",
  transition:
    "color 150ms, background-color 150ms, border-color 150ms, transform 150ms, translate 150ms, rotate 150ms",
  _active: { scale: "0.97" },
  ...(active
    ? { rotate: "-3deg", borderColor: "pink.600", bg: "pink.600", color: "white" }
    : {
        borderColor: "pink.200",
        color: "pink.700",
        _hover: { translate: "0 -0.125rem", bg: "white" },
      }),
});

const TopLists = (
  h: Html.H<typeof MusicBodyMessage.Type>,
  data: TopListsData,
  period: (typeof PERIODS)[number],
) => {
  const year = period === "last year";
  const artists = year ? data.topArtistsYear : data.topArtists;
  const albums = year ? data.topAlbumsYear : data.topAlbums;
  const tracks = year ? data.topTracksYear : data.topTracks;
  return [
    Cell(h, {
      tone: "white",
      label: View.text("Charts"),
      style: css.raw({ justifyContent: "space-between" }),
      children: [
        h.div
          .attrs({ role: "radiogroup", "aria-label": "Period" })
          .class(
            css({ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1.5" }),
          )
          .children(
            PERIODS.map((p) =>
              h.button
                .key(p)
                .attrs({ type: "button", role: "radio", "aria-checked": String(period === p) })
                .class(css(periodButton(period === p)))
                .on("click", MusicBodyMessage.PickedPeriod({ period: p }))
                .children(p),
            ),
          ),
        h.dl
          .class(
            css({
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              rowGap: "1",
              fontFamily: "mono",
              fontSize: "11px",
              color: "pink.950/65",
            }),
          )
          .children(
            h.dt.children("artists"),
            h.dd
              .class(css({ textAlign: "right", color: "pink.950" }))
              .children(data.stats.uniqueArtists.toLocaleString()),
            h.dt.children("albums"),
            h.dd
              .class(css({ textAlign: "right", color: "pink.950" }))
              .children(data.stats.uniqueAlbums.toLocaleString()),
          ),
      ],
    }).key("charts"),
    // The three lists share the rest of the row in equal parts, off the column
    // grid. On phones the wrapper drops out and they sit in the grid.
    h.div
      .key("lists")
      .class(
        css({
          display: "contents",
          md: { gridColumn: "span 3", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" },
          xl: { gridColumn: "span 5" },
        }),
      )
      .children(
        TopCell(h, { label: "Top artists", items: artists, tone: "yellow" }),
        TopCell(h, { label: "Top albums", items: albums, tone: "sky" }),
        TopCell(h, { label: "Top tracks", items: tracks, tone: "lilac" }),
      ),
  ];
};

/** One scrobble as a square sleeve: the cover fills the cell, the title sits on it. */
const Sleeve = <M>(h: Html.H<M>, track: LastFmTrack, big: boolean) =>
  Cell(h, {
    span: big ? "s2" : "1",
    tone: "ink",
    style: css.raw({ overflow: "hidden", p: "0", md: { p: "0" } }),
    children: [
      h.a
        .attrs({ href: track.url, ...ext })
        .class(
          css({
            position: "absolute",
            inset: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            p: "3",
            md: { p: "4" },
          }),
        )
        .children(
          track.art
            ? h.img.attrs({ src: track.art, alt: "", loading: "lazy" }).class(
                css({
                  position: "absolute",
                  inset: "0",
                  width: "full",
                  height: "full",
                  objectFit: "cover",
                }),
              )
            : null,
          h.span.attr("aria-hidden", "true").class(
            css({
              position: "absolute",
              inset: "0",
              backgroundImage:
                "linear-gradient(to top, color-mix(in oklab, var(--colors-pink-950) 85%, transparent), transparent, transparent)",
            }),
          ),
          big && track.nowPlaying
            ? h.span
                .class(
                  css({
                    position: "absolute",
                    top: "4",
                    left: "4",
                    display: "flex",
                    alignItems: "center",
                    gap: "2",
                    bg: "pink.600",
                    px: "2",
                    py: "1",
                    fontFamily: "mono",
                    fontSize: "10px",
                    letterSpacing: "widest",
                    color: "white",
                    textTransform: "uppercase",
                  }),
                )
                .children(
                  h.span.class(
                    css({
                      width: "1.5",
                      height: "1.5",
                      rounded: "full",
                      bg: "white",
                      animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      _motionReduce: { animation: "none" },
                    }),
                  ),
                  "Now playing",
                )
            : null,
          h.span
            .class(css({ position: "relative", minWidth: "0" }))
            .children(
              h.span
                .class(
                  css(
                    truncate,
                    { fontWeight: "semibold", color: "white" },
                    big ? { fontFamily: "display", fz: "2xl" } : { fontSize: "13px" },
                  ),
                )
                .children(track.track),
              h.span
                .class(css(truncate, { fontSize: "11px", color: "pink.50/80" }))
                .children(track.artist, track.nowPlaying ? null : ` · ${fmtRel(track.ts)}`),
            ),
        ),
    ],
  });

const Recent = <M>(h: Html.H<M>, tracks: ReadonlyArray<LastFmTrack>) => {
  const [lead, ...rest] = tracks;
  if (!lead) {
    return [
      Cell(h, {
        span: "w4",
        tone: "hatch",
        style: css.raw({ alignItems: "center", justifyContent: "center", textAlign: "center" }),
        children: [
          h.p.class(css({ fz: "sm", color: "pink.950/70" })).children(
            "last.fm did not answer. The full history is on ",
            h.a
              .attrs({ href: LASTFM_PROFILE_URL, ...ext })
              .class(textLink)
              .children("my profile"),
            ".",
          ),
        ],
      }).key("empty"),
    ];
  }
  // Covers fill the grid; tracks without one go to a plain text list after it.
  const covered = rest.filter((t) => t.art);
  const bare = rest.filter((t) => !t.art);
  return [
    Sleeve(h, lead, true).key("lead"),
    ...covered.map((t, i) => Sleeve(h, t, false).key(`${t.url}-${t.ts ?? i}`)),
    // The big sleeve takes 2 columns over 2 rows: 4 cells of area.
    ...Fill(h, 4 + covered.length),
    bare.length > 0
      ? Cell(h, {
          span: "w4",
          label: View.text(`${bare.length} more without cover art`),
          children: [
            h.ul.class(css({ columns: "1", columnGap: "8", md: { columns: "3" } })).children(
              bare.map((t, i) =>
                h.li
                  .key(`${t.url}-${t.ts ?? i}`)
                  .class(css({ breakInside: "avoid", py: "1" }))
                  .children(
                    h.a
                      .attrs({ href: t.url, ...ext })
                      .class(
                        css(truncate, {
                          fz: "sm",
                          color: "pink.950",
                          _hover: { color: "pink.600" },
                        }),
                      )
                      .children(
                        t.track,
                        h.span.class(css({ color: "pink.950/55" })).children(` · ${t.artist}`),
                      ),
                  ),
              ),
            ),
          ],
        }).key("bare")
      : null,
  ];
};

const Loading = <M>(h: Html.H<M>) =>
  Cell(h, {
    span: "w4",
    tone: "hatch",
    style: css.raw({ alignItems: "center", justifyContent: "center" }),
    children: [h.p.class(css(label)).children("Tuning in…")],
  });

/**
 * The charts and the sleeves. Last.fm needs a key the prerender doesn't have,
 * so this is left to the browser, which shows `Loading` until it answers.
 */
export const MusicBodyNoDeps = Html.component({
  name: "MusicBody",
  props: Schema.Struct({}),
  model: Schema.Struct({ period: PeriodSchema }),
  message: MusicBodyMessage,
  queries: {
    top: { query: GetTopLists, args: () => ({}) },
    recent: { query: GetRecentTracks, args: () => ({}) },
  },
}).make({
  init: () => ({ period: "last year" as const }),
  update: (_$, { period }) => ({ period }),
  view: (h, { period }) => {
    const { top, recent } = h.queries;
    // No scrobbles means last.fm did not answer; the panel below says so.
    const lists =
      AsyncResult.isSuccess(top) && top.value.stats.totalTracks
        ? TopLists(h, top.value, period)
        : AsyncResult.isInitial(top)
          ? [Loading(h).key("top-loading")]
          : [];
    const sleeves = AsyncResult.isSuccess(recent)
      ? Recent(h, recent.value.tracks)
      : [Loading(h).key("recent-loading")];
    return h.div.class(css({ display: "contents" })).children(lists, sleeves);
  },
});
export const MusicBody = MusicBodyNoDeps.pipe(
  Component.provide([GetTopLists.layer, GetRecentTracks.layer], { server: false }),
);

const countStyle = css({
  mt: "auto",
  fontFamily: "display",
  fz: "5xl",
  lineHeight: "none",
  fontWeight: "extrabold",
  color: "pink.950",
  fontVariantNumeric: "tabular-nums",
});

export const ScrobbleCountNoDeps = Html.component({
  name: "ScrobbleCount",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
  queries: { top: { query: GetTopLists, args: () => ({}) } },
}).make({
  init: () => ({}),
  update: ($) => $.model,
  view: (h) => {
    const top = h.queries.top;
    if (AsyncResult.isInitial(top)) return h.p.class(countStyle).children("…");
    const total = AsyncResult.isSuccess(top) ? top.value.stats.totalTracks : 0;
    if (!total) return h.div;
    return h.div
      .class(css({ display: "contents" }))
      .children(
        h.p.class(countStyle).children(total.toLocaleString()),
        h.p
          .class(css({ fontFamily: "mono", fontSize: "11px", color: "pink.950/60" }))
          .children("scrobbles so far"),
      );
  },
});
export const ScrobbleCount = ScrobbleCountNoDeps.pipe(
  Component.provide(GetTopLists.layer, { server: false }),
);

export const Music = Html.component({
  name: "Music",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  head: () => [
    ...seoHead({
      title: "Music",
      description: "Recently played tracks via Last.fm",
      ogImage: ogPageImageUrl("music"),
      path: "/music",
    }),
  ],
  view: (h) =>
    Box(h).children(
      PageHead(h, {
        title: "Music",
        tone: "pink",
        kicker: [
          "These are just vibes, pure vibes. Scrobbled using ",
          h.a
            .attrs({ href: LASTFM_PROFILE_URL, ...ext })
            .class(textLink)
            .children("last.fm"),
          ".",
        ],
        aside: [
          ScrobbleCount(h, {
            key: "count",
            fallback: () => h.p.class(countStyle).children("…"),
          }),
        ],
      }),
      MusicBody(h, { key: "body", fallback: () => Loading(h) }),
    ),
});
