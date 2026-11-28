import { Html } from "@effect/ui/html";
import { UiSchema } from "@effect/ui";
import { Schema } from "effect";
import { css } from "../../styled-system/css";
import siteData from "../data/sites";
import { currentRoles, pastRoles } from "../data/work-experience";
import { openSource, prUrl } from "../data/open-source";
import { uses } from "../data/uses";
import { neighbours } from "../data/neighbours";
import { allPosts, allProjects } from "virtual:content";
import { listPosts } from "../lib/posts";
import { getProject, listProjects } from "../lib/projects";
import { emptyContributions, type ContributionsResponse } from "../features/github/types";
import type { LastFmTrack } from "../features/music/types";
import { GetRecentTracks } from "../queries/GetRecentTracks";
import { Component } from "@effect/ui";
import { AsyncResult } from "effect/reactivity";
import { AppPill } from "./app-pill";
import { LastPushTag, StatusBoard, StatusTile, timeAgo } from "./based-row";
import { Box, Cell, label, ruleColor, stretched, type Style } from "./box";
import { Stamp, type StampTone } from "./pagehead";
import { ProjectMark } from "./project-mark";

/**
 * Staggers a hover transition down a list: item `i` starts `step` ms after the
 * one before. Only hover-in waits (`delayed`), so hover-out returns every item
 * at once. Cells are `group`s: see `Cell` below.
 */
const stagger = (i: number, step = 45) => ({ "--d": `${i * step}ms` });
const delayed: Style = { _groupHover: { transitionDelay: "var(--d)" } };

/** A cell other things in it react to when it is hovered. */
const GCell: typeof Cell = (h, options) => Cell(h, options).class("group");

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const white70 = "color-mix(in oklab, white 70%, transparent)";

/** GitHub, LinkedIn and the résumé first, so the filled call to action closes the strip. */
const links = [
  { label: "GitHub", href: siteData.github, external: true },
  { label: "LinkedIn", href: siteData.linkedin, external: true },
  { label: "Résumé", href: siteData.cv, external: true },
  { label: "Work with me", href: `mailto:${siteData.email}`, external: false },
] as const;

const monthYear = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Where the sparkles pop round the word, and when, in ms after the hop starts. */
const SPARKS = [
  { at: { left: "-0.25em", top: "-0.1em" }, d: 90 },
  { at: { left: "52%", top: "-0.45em" }, d: 200 },
  { at: { right: "-0.35em", top: "0.05em" }, d: 290 },
];

const DelightfulMessage = UiSchema.TaggedEnum({ EnteredWord: {} });

/**
 * The hero's accent word. The letters hop in a wave, the squiggle redraws, and
 * sparkles pop, on load and on every pointer entry (see `.delight-*` in
 * `panda/global.ts`). Counting the entries in `run` and keying the letters by
 * it remounts them, so each run plays in full.
 */
export const Delightful = Html.component({
  name: "Delightful",
  props: Schema.Struct({}),
  model: Schema.Struct({ run: Schema.Number }),
  message: DelightfulMessage,
}).make({
  init: () => ({ run: 0 }),
  update: ($) => $.evolve({ run: (n) => n + 1 }),
  view: (h, { run }) =>
    h.em
      .class(css({ position: "relative", fontStyle: "normal", color: "pink.600" }))
      .on("mouseenter", DelightfulMessage.EnteredWord())
      .children(
        h.span
          .class(
            css({
              position: "absolute",
              width: "1px",
              height: "1px",
              overflow: "hidden",
              clip: "rect(0 0 0 0)",
              whiteSpace: "nowrap",
            }),
          )
          .children("delightful"),
        h.span
          .key(String(run))
          .class(css({ whiteSpace: "nowrap" }))
          .attr("aria-hidden", "true")
          .children(
            "delightful".split("").map((letter, i) =>
              h.span
                .key(String(i))
                .class("delight-letter")
                .style({ "--d": `${i * 30}ms`, "--tilt": `${i % 2 ? 6 : -6}deg` })
                .children(letter),
            ),
            SPARKS.map(({ at, d }) =>
              h.span
                .key(`spark-${d}`)
                .class(
                  "delight-spark",
                  css({
                    pointerEvents: "none",
                    position: "absolute",
                    fontSize: "0.32em",
                    lineHeight: "none",
                    color: "pink.400",
                  }),
                )
                .style({ ...at, "--d": `${d}ms` })
                .children("✦"),
            ),
            h.svg
              .class(
                css({
                  position: "absolute",
                  bottom: "-1.5",
                  left: "0",
                  height: "2.5",
                  width: "full",
                  color: "pink.300",
                }),
              )
              .attrs({ viewBox: "0 0 200 12", preserveAspectRatio: "none" })
              .children(
                h.path.class("delight-line").attrs({
                  d: "M2 8 Q 50 1 100 6 T 198 4",
                  pathLength: "1",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "4",
                  "stroke-linecap": "round",
                }),
              ),
          ),
      ),
});

const IntroCell = <M>(h: Html.H<M>) => {
  const body = css({
    display: "flex",
    flex: "1",
    flexDirection: "column",
    gap: "5",
    p: "4",
    md: { p: "6" },
  });
  const linkBase: Style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "2",
    px: "4",
    py: "3",
    fontFamily: "mono",
    fontSize: "11px",
    letterSpacing: "wide",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    transition: "color 150ms, background-color 150ms",
    borderColor: ruleColor,
    "&:not(:last-child)": { borderRightWidth: "1px" },
    "&:nth-child(-n+2)": { borderBottomWidth: "1px", md: { borderBottomWidth: "0" } },
    "&:hover > span": { transform: "translate(0.125rem, -0.125rem)" },
  };
  const plain = css(linkBase, {
    color: "pink.950/80",
    _hover: { bg: "pink.50", color: "pink.700" },
  });
  const primary = css(linkBase, { bg: "pink.600", color: "white", _hover: { bg: "pink.700" } });
  const arrow = css({ transition: "transform 150ms" });
  const prose = css({ textWrap: "pretty" });
  return h.section
    .attr("aria-labelledby", "hero-heading")
    .class(
      css({
        gridColumn: "span 2",
        gridRow: "span 2",
        display: "flex",
        minWidth: "0",
        flexDirection: "column",
        borderRightWidth: "1px",
        borderBottomWidth: "1px",
        borderColor: ruleColor,
        bg: white70,
        xl: { gridColumn: "1 / 4", gridRow: "1 / 3" },
      }),
    )
    .children(
      h.div.class(body).children(
        h.div
          .class(
            css({
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "3",
            }),
          )
          .children(h.p.class(css(label)).children("Frontend-leaning product engineer")),
        h.h1
          .id("hero-heading")
          .class(
            css({
              fontFamily: "display",
              fz: "sm",
              fontWeight: "bold",
              letterSpacing: "wide",
              color: "pink.950",
              textTransform: "uppercase",
            }),
          )
          .children(
            "Dicha Z",
            h.span
              .class(css({ color: "pink.500" }))
              .attr("title", "Yes, this is where the username comes from")
              .children("elianiva"),
            "n Arkana",
          ),
        h.p
          .class(
            css({
              fontFamily: "display",
              fontSize: { base: "8cqw", md: "4.1cqw", xl: "3.5cqw" },
              lineHeight: "1.05",
              fontWeight: "extrabold",
              color: "pink.950",
              textWrap: "pretty",
            }),
          )
          .children(
            "I care about making fast software that’s ",
            Delightful(h, { key: "delightful" }),
            " to use.",
          ),
        h.div
          .class(
            css({
              mt: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "3",
              fontSize: { base: "15px", xl: "base" },
              lineHeight: "2.1",
              color: "pink.950/80",
              textWrap: "pretty",
            }),
          )
          .children(
            h.p.class(prose).children(
              "I work at ",
              AppPill(h, {
                name: "Aerotalon",
                href: "https://aerotalon.com",
                icon: "/assets/company-favicons/aerotalon.jpg",
              }),
              " on software that makes aviation operations easier: less paperwork, fewer handoffs, and records that keep up with the people doing the work.",
            ),
            h.p.class(prose).children(
              "Outside work, I tinker with my own things. ",
              AppPill(h, {
                name: "Quorum",
                href: "https://playquorum.dev",
                icon: "/assets/project-icons/quorum.webp",
              }),
              " is a game about designing systems that survive real traffic. ",
              AppPill(h, {
                name: "Meiro",
                href: "https://github.com/elianiva/meiro",
                icon: "/assets/project-icons/meiro.webp",
              }),
              " is a desktop YouTube Music client that feels native, and ",
              AppPill(h, {
                name: "Mizook",
                href: "https://github.com/elianiva/mizook",
                icon: "/assets/project-icons/mizook.webp",
              }),
              " is my own assistant: chat, a bot, and an agent that runs on its own.",
            ),
          ),
      ),
      h.nav
        .attr("aria-label", "Contact and profiles")
        .class(
          css({
            display: "grid",
            gridTemplateColumns: { base: "repeat(2, 1fr)", md: "1fr 1fr 1fr 1.5fr" },
            borderTopWidth: "1px",
            borderColor: ruleColor,
          }),
        )
        .children(
          links.map((link) =>
            h.a
              .key(link.label)
              .class(link.external ? plain : primary)
              .attrs(
                link.external
                  ? { href: link.href, ...ext }
                  : { href: link.href, title: "Email me about work" },
              )
              .children(link.label, h.span.attr("aria-hidden", "true").class(arrow).children("↗")),
          ),
        ),
    );
};

/** Tall beside the intro on wide screens, so the cover art gets room. */
const LISTENING: Style = { xl: { gridColumn: "6", gridRow: "1 / 3" } };

const LabelLink = <M>(h: Html.H<M>, href: string, text: string) =>
  h.a.class(css(stretched)).attr("href", href).children(text);

/** The cell before a cover is in: a dashed disc, and the track when there is one without art. */
export const ListeningEmpty = <M>(
  h: Html.H<M>,
  track: LastFmTrack | undefined,
  answered: boolean,
) =>
  GCell(h, {
    linked: true,
    tone: "pink",
    label: LabelLink(h, "/music", track?.nowPlaying ? "Listening now" : "Last played"),
    style: LISTENING,
    children: [
      h.div.class(css({ display: "grid", flex: "1", placeItems: "center" })).children(
        h.span
          .class(
            css({
              display: "grid",
              width: "20",
              height: "20",
              rotate: "6deg",
              placeItems: "center",
              rounded: "full",
              border: "2px dashed",
              borderColor: "color-mix(in oklab, var(--colors-pink-400) 70%, transparent)",
              fontFamily: "mono",
              fz: "2xl",
              color: "pink.500",
            }),
          )
          .children("♪"),
      ),
      track
        ? h.p
            .class(css({ minWidth: "0", fz: "sm", lineHeight: "snug", color: "pink.950/70" }))
            .children(
              h.span
                .class(css(trunc, { fontWeight: "medium", color: "pink.950" }))
                .children(track.track),
              h.span.class(css(trunc)).children(track.artist),
            )
        : answered
          ? h.p.class(css({ fz: "sm", color: "pink.950/65" })).children("last.fm did not answer.")
          : null,
    ],
  });

const trunc: Style = {
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const ListeningMessage = Schema.Never;

/** The last five scrobbles. Last.fm is read in the browser, so the prerender shows the empty disc. */
export const ListeningCellNoDeps = Html.component({
  name: "ListeningCell",
  props: Schema.Struct({}),
  model: Schema.Struct({ now: Schema.NullOr(Schema.Number) }),
  message: ListeningMessage,
  queries: { recent: { query: GetRecentTracks, args: () => ({}) } },
}).make({
  init: () => ({ now: null }),
  update: ($) => $.model,
  view: (h) => {
    const result = h.queries.recent;
    const [track, ...earlier] = (AsyncResult.isSuccess(result) ? result.value.tracks : []).slice(
      0,
      5,
    );
    if (!track?.art) return ListeningEmpty(h, track, !AsyncResult.isInitial(result));
    const now = Date.now();
    return GCell(h, {
      linked: true,
      tone: "pink",
      label: LabelLink(h, "/music", track.nowPlaying ? "Listening now" : "Last played"),
      style: css.raw({
        overflow: "hidden",
        xl: { gap: "4", ...LISTENING.xl },
        "& > :first-child": { position: "relative", zIndex: "10" },
        xlDown: { "& h2": { color: "rgb(255 255 255 / 0.8)" } },
      }),
      // The cover keeps its own square: last.fm art is only 300px, so it never
      // stretches. On wide screens it sits in a jewel case with the disc
      // peeking out behind it, spinning while the track plays.
      children: [
        h.div
          .class(
            css({
              position: "absolute",
              inset: "0",
              xl: { position: "relative", inset: "auto", mr: "7" },
            }),
          )
          .children(
            h.span.attr("aria-hidden", "true").class(
              css({
                position: "absolute",
                top: "3%",
                left: "3%",
                display: "none",
                aspectRatio: "1",
                width: "94%",
                rounded: "full",
                background:
                  "conic-gradient(from 20deg, #f5d0fe, #e0f2fe, #fef9c3, #fbcfe8, #ddd6fe, #e0f2fe, #f5d0fe)",
                boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.5)",
                transition: "translate 300ms cubic-bezier(0.23, 1, 0.32, 1)",
                mask: "radial-gradient(circle, #0000 9%, #000 9.5%, #000 17%, #0003 17.5%, #0003 19%, #000 19.5%)",
                xl: {
                  display: "block",
                  translate: "1.5rem 0",
                  _groupHover: { translate: "2.25rem 0" },
                },
              }),
              track.nowPlaying && css({ _motionSafe: { animation: "spin 4s linear infinite" } }),
            ),
            h.img
              .class(
                css({
                  position: "relative",
                  width: "full",
                  height: "full",
                  objectFit: "cover",
                  opacity: "0.9",
                  xl: {
                    aspectRatio: "1",
                    height: "auto",
                    opacity: "1",
                    boxShadow: "3px 3px 0 rgb(190 24 93 / 0.18)",
                  },
                }),
              )
              .attrs({
                src: track.art,
                alt: track.album ? `${track.album} cover` : "",
                decoding: "async",
                loading: "lazy",
              }),
            // The case's hinge: a lighter strip down the left edge.
            h.span.attr("aria-hidden", "true").class(
              css({
                position: "absolute",
                top: "0",
                bottom: "0",
                left: "0",
                display: "none",
                width: "2",
                borderRightWidth: "1px",
                borderColor: "rgb(255 255 255 / 0.4)",
                bg: "rgb(255 255 255 / 0.2)",
                xl: { display: "block" },
              }),
            ),
          ),
        h.span.attr("aria-hidden", "true").class(
          css({
            position: "absolute",
            inset: "0",
            backgroundImage:
              "linear-gradient(to top, color-mix(in oklab, var(--colors-pink-950) 85%, transparent), color-mix(in oklab, var(--colors-pink-950) 10%, transparent), color-mix(in oklab, var(--colors-pink-950) 75%, transparent))",
            xl: { display: "none" },
          }),
        ),
        h.div
          .class(
            css({
              position: "relative",
              mt: "auto",
              minWidth: "0",
              fz: "sm",
              lineHeight: "snug",
              color: "white",
              xl: { mt: "0", color: "pink.950" },
            }),
          )
          .children(
            h.p
              .class(css({ ...trunc, fontWeight: "semibold", xl: { fz: "base" } }))
              .children(track.track),
            h.p.class(css({ ...trunc, opacity: "0.8" })).children(track.artist),
            h.p
              .class(
                css({
                  ...trunc,
                  mt: "1",
                  display: "none",
                  fontFamily: "mono",
                  fontSize: "10px",
                  letterSpacing: "wider",
                  textTransform: "uppercase",
                  opacity: "0.6",
                  xl: { display: "block" },
                }),
              )
              .children(
                track.album ? `${track.album} · ` : null,
                track.nowPlaying ? "on now" : track.ts ? timeAgo(track.ts, now) : null,
              ),
          ),
        earlier.length > 0
          ? h.ol
              .class(
                css({
                  position: "relative",
                  mt: "auto",
                  display: "none",
                  borderTopWidth: "1px",
                  borderStyle: "dashed",
                  borderColor: "pink.300/70",
                  color: "pink.950",
                  xl: { display: "block" },
                }),
              )
              .children(
                earlier.map((play, i) =>
                  h.li
                    .key(`${play.url}-${play.ts ?? i}`)
                    .class(
                      css({
                        display: "flex",
                        alignItems: "baseline",
                        gap: "2",
                        borderBottomWidth: "1px",
                        borderStyle: "dashed",
                        borderColor: "pink.200/80",
                        py: "1.5",
                        _last: { borderBottomWidth: "0" },
                      }),
                    )
                    .children(
                      h.span
                        .class(
                          css({
                            ...trunc,
                            display: "block",
                            minWidth: "0",
                            flex: "1",
                            fontSize: "12px",
                          }),
                        )
                        .children(
                          play.track,
                          h.span.class(css({ opacity: "0.55" })).children(` · ${play.artist}`),
                        ),
                      play.ts
                        ? h.span
                            .class(
                              css({
                                flexShrink: "0",
                                fontFamily: "mono",
                                fontSize: "10px",
                                opacity: "0.5",
                              }),
                            )
                            .children(timeAgo(play.ts, now))
                        : null,
                    ),
                ),
              )
          : null,
      ],
    });
  },
});
export const ListeningCell = ListeningCellNoDeps.pipe(
  Component.provide(GetRecentTracks.layer, { server: false }),
);

const HEAT = [
  css({ bg: "pink.100/60" }),
  css({ bg: "pink.200" }),
  css({ bg: "pink.300" }),
  css({ bg: "pink.400" }),
  css({ bg: "pink.600" }),
];
const LEVEL: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const BAR_BASE: Style = {
  display: "flex",
  minHeight: "3px",
  flex: "1",
  flexDirection: "column-reverse",
  bg: "pink.100",
  opacity: "0.75",
  transition: "opacity 200ms",
  ...delayed,
  _groupHover: { opacity: "1", transitionDelay: "var(--d)" },
  "&:hover": { opacity: "0.6 !important" },
};
const BAR = css(BAR_BASE);
const BAR_EARLY = css(BAR_BASE, { display: { base: "none", md: "flex" } });

/**
 * The past year as a barcode: one bar per week, rising from the card's bottom
 * edge. A bar's height is the week's total against the busiest week, stacked
 * day by day in each day's heat colour, so the busiest weeks reach the top.
 * Hovering the cell runs a scan across, left to right. Phones get the last 26
 * weeks. Without data (`null`) every week is a flat stub and no count shows.
 */
const GitCell = <M>(h: Html.H<M>, data: ContributionsResponse | null) => {
  const weeks = (data ?? emptyContributions()).weeks.slice(-53).map((week) => {
    const days = [...week.contributionDays].sort((x, y) => x.date.localeCompare(y.date));
    return { days, total: days.reduce((sum, day) => sum + day.contributionCount, 0) };
  });
  const busiest = Math.max(1, ...weeks.map((week) => week.total));
  return GCell(h, {
    linked: true,
    span: "w2",
    style: css.raw({ xl: { gridColumn: "1 / 3", gridRow: "3" } }),
    label: h.a
      .class(css(stretched))
      .attrs({ href: siteData.github, ...ext })
      .children("Git activity"),
    children: [
      data
        ? h.p
            .class(
              css({ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: "3" }),
            )
            .children(
              h.span
                .class(
                  css({
                    fontFamily: "mono",
                    fz: "4xl",
                    fontWeight: "bold",
                    color: "pink.600",
                    fontVariantNumeric: "tabular-nums",
                  }),
                )
                .children(data.totalContributions.toLocaleString("en-US")),
              h.span
                .class(css({ fz: "sm", color: "pink.950/65" }))
                .children("contributions in the past year"),
            )
        : h.p
            .class(css({ fz: "sm", color: "pink.950/65" }))
            .children("The contribution count did not load. It is on GitHub."),
      h.div
        .class(
          css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "3" }),
        )
        .children(
          LastPushTag(h, { key: "last-push", fallback: () => h.span }),
          data
            ? h.span
                .class(
                  css({ ml: "auto", fontFamily: "mono", fontSize: "11px", color: "pink.950/50" }),
                )
                .children(`longest streak ${data.longestStreak}d`)
            : null,
        ),
      // Takes the rest of the cell and runs to its sides and bottom.
      h.div
        .attr("aria-hidden", "true")
        .class(
          css({
            mx: "-4",
            mb: "-4",
            display: "flex",
            minHeight: "20",
            flex: "1",
            alignItems: "flex-end",
            gap: "2px",
            borderTopWidth: "1px",
            borderStyle: "dashed",
            borderColor: "pink.200/70",
            px: "1px",
            md: { mx: "-5", mb: "-5" },
          }),
        )
        .children(
          weeks.map((week, w) =>
            h.span
              .key(week.days[0]?.date ?? String(w))
              .class(w < weeks.length - 26 ? BAR_EARLY : BAR)
              .attr(
                "title",
                week.days[0]
                  ? `Week of ${week.days[0].date} · ${week.total} contributions`
                  : undefined,
              )
              .style({ height: `${(week.total / busiest) * 100}%`, ...stagger(w, 5) })
              .children(
                week.days.map((day) =>
                  day.contributionCount > 0
                    ? h.span
                        .key(day.date)
                        .class(HEAT[LEVEL[day.contributionLevel] ?? 0])
                        .style({ flexGrow: String(day.contributionCount) })
                    : null,
                ),
              ),
          ),
        ),
    ],
  });
};

const WritingCell = <M>(h: Html.H<M>) =>
  GCell(h, {
    linked: true,
    span: "w2",
    tone: "yellow",
    style: css.raw({ xl: { gridColumn: "4 / 6", gridRow: "2" } }),
    label: LabelLink(h, "/posts", "Writing"),
    children: [
      h.ul
        .class(
          css({ display: "flex", flex: "1", flexDirection: "column", justifyContent: "flex-end" }),
        )
        .children(
          listPosts(allPosts, { limit: 3 }).map((post, i) =>
            h.li
              .key(post.slug)
              .style(stagger(i, 60))
              .class(
                css({
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1fr) auto",
                  alignItems: "baseline",
                  columnGap: "2",
                  rowGap: "1",
                  borderBottomWidth: "1px",
                  borderStyle: "dashed",
                  borderColor: "pink.300/70",
                  py: "2.5",
                  transition: "transform 300ms",
                  _last: { borderBottomWidth: "0" },
                  ...delayed,
                }),
              )
              .children(
                h.span
                  .class(
                    css({
                      fontFamily: "mono",
                      fontSize: "11px",
                      fontWeight: "normal",
                      color: "pink.500",
                      transition: "color 150ms",
                      _groupHover: { color: "pink.700" },
                    }),
                  )
                  .children(`0${i + 1}`),
                h.a
                  .class(
                    css({
                      position: "relative",
                      zIndex: "10",
                      fontFamily: "display",
                      fontSize: "17px",
                      lineHeight: "snug",
                      fontWeight: "semibold",
                      color: "pink.950",
                      _hover: { color: "pink.600" },
                    }),
                  )
                  .attr("href", `/posts/${post.slug}`)
                  .children(post.title),
                h.span
                  .class(css({ fontFamily: "mono", fontSize: "11px", color: "pink.950/55" }))
                  .children(monthYear.format(new Date(post.date))),
                post.description
                  ? h.span
                      .class(
                        css({
                          gridColumn: "2 / span 2",
                          lineClamp: "2",
                          overflow: "hidden",
                          fz: "sm",
                          lineHeight: "snug",
                          color: "pink.950/60",
                        }),
                      )
                      .children(post.description)
                  : null,
              ),
          ),
        ),
    ],
  });

/** "2024-04" as a year with a fraction; a current role ends now. */
function asYear(month: string | null, now: Date): number {
  if (!month) return now.getUTCFullYear() + now.getUTCMonth() / 12;
  return Number(month.slice(0, 4)) + (Number(month.slice(5, 7)) - 1) / 12;
}

const GANTT_COLS: Style = {
  gridTemplateColumns: {
    base: "minmax(0, 1.5fr) minmax(0, 1fr)",
    md: "minmax(0, 1fr) minmax(0, 1.15fr)",
  },
};
const BAR_DONE = css({
  position: "absolute",
  top: "0",
  bottom: "0",
  transformOrigin: "left",
  transition: "scale 200ms ease-out, background-color 200ms ease-out",
  bg: "pink.300",
  _groupHover: { bg: "pink.400", transitionDelay: "var(--d)" },
});
const BAR_LIVE = css({
  position: "absolute",
  top: "0",
  bottom: "0",
  transformOrigin: "left",
  transition: "scale 200ms ease-out, background-color 200ms ease-out",
  bg: "pink.500",
  clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 50%, calc(100% - 7px) 100%, 0 100%)",
  _groupHover: { transitionDelay: "var(--d)" },
});

/**
 * Every role as a row of a Gantt chart: the company and the job on the left,
 * the stretch of years it took on the right, on one shared axis.
 */
const ExperienceCell = <M>(h: Html.H<M>) => {
  const roles = [...currentRoles(), ...pastRoles()];
  const now = new Date();
  const from = Math.floor(Math.min(...roles.map((r) => asYear(r.period[0], now))));
  const to = Math.ceil(asYear(null, now));
  const at = (year: number) => ((year - from) / (to - from)) * 100;
  const ticks = Array.from({ length: to - from + 1 }, (_, k) => from + k);
  const axis = {
    backgroundImage: `repeating-linear-gradient(90deg, rgb(251 207 232 / 0.8) 0 1px, transparent 1px calc(100% / ${to - from}))`,
  };
  return GCell(h, {
    linked: true,
    span: "w2",
    style: css.raw({ xl: { gridColumn: "2 / 4", gridRow: "4" } }),
    label: LabelLink(h, "/work", "Experience"),
    children: [
      h.div
        .class(
          css({
            display: "flex",
            flex: "1",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "2",
          }),
        )
        .children(
          h.ol.children(
            roles.map((role, i) => {
              const start = asYear(role.period[0], now);
              const end = asYear(role.period[1], now);
              return h.li
                .key(role.company)
                .class(
                  css(GANTT_COLS, {
                    display: "grid",
                    alignItems: "center",
                    gap: "4",
                    borderBottomWidth: "1px",
                    borderStyle: "dashed",
                    borderColor: ruleColor,
                    py: "1.5",
                    _last: { borderBottomWidth: "0" },
                  }),
                )
                .children(
                  h.div.class(css({ minWidth: "0" })).children(
                    h.p
                      .class(
                        css({
                          ...trunc,
                          fontSize: "15px",
                          lineHeight: "snug",
                          color: "pink.950",
                        }),
                      )
                      .children(role.company),
                    h.p
                      .class(
                        css({
                          ...trunc,
                          fontFamily: "mono",
                          fontSize: "10px",
                          color: "pink.950/50",
                        }),
                      )
                      .children(`${role.position} · ${role.time}`),
                  ),
                  h.div
                    .class(css({ position: "relative", height: "3" }))
                    .style(axis)
                    .children(
                      h.span.class(role.period[1] ? BAR_DONE : BAR_LIVE).style({
                        left: `${at(start)}%`,
                        width: `${Math.max(at(end) - at(start), 1.5) + (role.period[1] ? 0 : 2)}%`,
                        ...stagger(i, 40),
                      }),
                    ),
                );
            }),
          ),
          h.div
            .attr("aria-hidden", "true")
            .class(css(GANTT_COLS, { display: "grid", gap: "4" }))
            .children(
              h.span
                .class(css({ fontFamily: "mono", fontSize: "10px", color: "pink.950/45" }))
                .children(`${roles.length} roles`),
              h.div
                .class(
                  css({
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "mono",
                    fontSize: "10px",
                    color: "pink.950/45",
                  }),
                )
                .children(
                  ticks.map((year) =>
                    h.span.key(String(year)).children(`’${String(year).slice(2)}`),
                  ),
                ),
            ),
        ),
    ],
  });
};

/** The three projects the home page shows, in order. */
const FEATURED = ["quorum", "meiro", "mizook"];
const PROJECT_AT: Style[] = [
  { xl: { gridColumn: "3", gridRow: "3" } },
  { xl: { gridColumn: "4", gridRow: "3" } },
  { xl: { gridColumn: "5", gridRow: "3" } },
];

const ProjectCells = <M>(h: Html.H<M>) => {
  const featured = FEATURED.flatMap((slug) => getProject(allProjects, slug)?.project ?? []);
  const total = listProjects(allProjects).length;
  return [
    ...featured.map((project, i) =>
      GCell(h, {
        linked: true,
        style: PROJECT_AT[i] ?? {},
        label: LabelLink(h, `/projects/${project.slug}`, "Project"),
        children: [
          // A third of the card, so the icon holds its half of the cell.
          ProjectMark(h, {
            slug: project.slug,
            title: project.title,
            style: css.raw({
              aspectRatio: "1",
              height: "auto",
              width: "34%",
              p: "5%",
              boxShadow: "0 4px 0 rgba(190,24,93,0.13)",
            }),
          }),
          h.div.class(css({ mt: "auto", minWidth: "0" })).children(
            h.p
              .class(
                css({
                  width: "fit-content",
                  backgroundImage: "linear-gradient(currentColor, currentColor)",
                  backgroundSize: "0% 2px",
                  backgroundPosition: "left bottom",
                  backgroundRepeat: "no-repeat",
                  fontFamily: "display",
                  fz: "lg",
                  fontWeight: "bold",
                  color: "pink.950",
                  transition: "background-size 300ms, color 300ms",
                  _groupHover: { backgroundSize: "100% 2px", color: "pink.600" },
                }),
              )
              .children(project.title),
            h.p
              .class(
                css({
                  lineClamp: "2",
                  overflow: "hidden",
                  fz: "sm",
                  lineHeight: "snug",
                  color: "pink.950/65",
                }),
              )
              .children(project.description),
          ),
        ],
      }).key(project.slug),
    ),
    GCell(h, {
      linked: true,
      tone: "hot",
      style: css.raw({ xl: { gridColumn: "6", gridRow: "3" } }),
      label: LabelLink(h, "/projects", "All projects"),
      children: [
        h.p
          .class(
            css({
              mt: "auto",
              transformOrigin: "bottom left",
              fontFamily: "display",
              fz: "7xl",
              lineHeight: "none",
              fontWeight: "extrabold",
              fontVariantNumeric: "tabular-nums",
            }),
          )
          .children(String(total)),
        h.p.class(css({ fz: "sm", opacity: "0.85" })).children("things I've built, newest first"),
      ],
    }).key("all-projects"),
  ];
};

const PR_TONES: StampTone[] = ["lilac", "pink", "sky", "yellow"];

/**
 * Merged PRs as a `git log --graph`: each repo branches off a dashed main
 * line, its PR numbers printed as stamps that open the pull request.
 */
const OpenSourceCell = <M>(h: Html.H<M>) =>
  GCell(h, {
    linked: true,
    span: "w2",
    tone: "lilac",
    style: css.raw({ xl: { gridColumn: "4 / 6", gridRow: "4" } }),
    label: LabelLink(h, "/work#open-source", "Open source"),
    children: [
      h.ol
        .class(
          css({
            position: "relative",
            mt: "1",
            ml: "1.5",
            borderLeftWidth: "2px",
            borderStyle: "dashed",
            borderColor: "purple.300",
          }),
        )
        .children(
          openSource.map((entry) => {
            const [owner] = entry.repo.split("/");
            const shown = entry.prs.slice(0, 3);
            return h.li
              .key(entry.repo)
              .class(
                css({
                  position: "relative",
                  py: "2",
                  pl: "7",
                  _first: { pt: "0" },
                  _last: { pb: "0" },
                }),
              )
              .children(
                h.span.attr("aria-hidden", "true").class(
                  css({
                    position: "absolute",
                    top: "50%",
                    left: "0",
                    height: "0.5",
                    width: "5",
                    bg: "purple.300",
                  }),
                ),
                h.span.attr("aria-hidden", "true").class(
                  css({
                    position: "absolute",
                    top: "50%",
                    left: "-7px",
                    width: "3",
                    height: "3",
                    translate: "0 -50%",
                    rounded: "full",
                    border: "2px solid",
                    borderColor: "purple.400",
                    bg: "white",
                    transition: "background-color 300ms",
                    _groupHover: { bg: "purple.400" },
                  }),
                ),
                h.div
                  .class(css({ display: "flex", minWidth: "0", alignItems: "center", gap: "2.5" }))
                  .children(
                    h.img
                      .class(
                        css({
                          width: "6",
                          height: "6",
                          flexShrink: "0",
                          rounded: "md",
                          bg: "white",
                          boxShadow: "0 0 0 1px var(--colors-purple-200)",
                        }),
                      )
                      .attrs({
                        src: `https://github.com/${owner}.png?size=48`,
                        alt: "",
                        loading: "lazy",
                        decoding: "async",
                      }),
                    h.a
                      .class(
                        css({
                          position: "relative",
                          zIndex: "10",
                          minWidth: "0",
                          ...trunc,
                          fontFamily: "mono",
                          fontSize: "13px",
                          color: "pink.800",
                          _hover: { color: "pink.600" },
                        }),
                      )
                      .attrs({ href: `https://github.com/${entry.repo}`, ...ext })
                      .children(entry.repo),
                    h.span
                      .class(
                        css({
                          ml: "auto",
                          display: "flex",
                          flexShrink: "0",
                          alignItems: "center",
                          gap: "1",
                        }),
                      )
                      .children(
                        shown.map((pr, i) =>
                          h.a
                            .key(String(pr.number))
                            .style(stagger(i, 70))
                            .class(
                              css(
                                {
                                  position: "relative",
                                  zIndex: "10",
                                  transition: "transform 300ms",
                                  _groupHover: { transitionDelay: "var(--d)" },
                                  _hover: { translate: "0 -0.375rem !important" },
                                },
                                i % 2 ? { rotate: "3deg" } : { rotate: "-2deg" },
                                i > 0 && { smDown: { display: "none" } },
                              ),
                            )
                            .attrs({ href: prUrl(entry.repo, pr.number), title: pr.title, ...ext })
                            .children(
                              Stamp(h, {
                                tone: PR_TONES[i % 4] ?? "yellow",
                                style: css.raw({ filter: "none" }),
                                children: [
                                  h.span
                                    .class(
                                      css({
                                        fontFamily: "mono",
                                        fontSize: "10px",
                                        lineHeight: "none",
                                      }),
                                    )
                                    .children(`#${pr.number}`),
                                ],
                              }),
                            ),
                        ),
                        entry.prs.length > shown.length
                          ? h.span
                              .class(
                                css({ fontFamily: "mono", fontSize: "10px", color: "pink.950/55" }),
                              )
                              .children(`+${entry.prs.length - shown.length}`)
                          : null,
                      ),
                  ),
              );
          }),
        ),
    ],
  });

/** What I reach for in each slot, by name from the uses list. */
const LOADOUT = [
  { slot: "Machine", name: "MacBook Air", glyph: "⌘" },
  { slot: "Editor", name: "Zed", glyph: "¶" },
  { slot: "Keyboard", name: "Mao Wang GK65", glyph: "⌨" },
  { slot: "Language", name: "TypeScript", glyph: "λ" },
  { slot: "Agent", name: "AmpCode", glyph: "✦" },
  { slot: "Camera", name: "Fujifilm X-T20", glyph: "◉" },
] as const;

/**
 * The uses page as a till receipt: one line per slot with a dotted leader to
 * what sits in it, a count, and a barcode, filling the whole cell.
 */
const UsesCell = <M>(h: Html.H<M>) => {
  const items = uses.flatMap((section) => section.items);
  return GCell(h, {
    linked: true,
    tone: "white",
    style: css.raw({ containerType: "inline-size", xl: { gridColumn: "1", gridRow: "4" } }),
    label: LabelLink(h, "/uses", "Uses"),
    children: [
      h.div
        .class(
          css({
            mx: "-4",
            display: "flex",
            flex: "1",
            flexDirection: "column",
            gap: "2",
            borderTopWidth: "1px",
            borderStyle: "dashed",
            borderColor: "pink.200",
            px: "4",
            pt: "2.5",
            fontFamily: "mono",
            fontSize: "11px",
            color: "pink.950",
            md: { mx: "-5", px: "5" },
          }),
        )
        .children(
          h.ul.class(css({ display: "flex", flexDirection: "column", gap: "1.5" })).children(
            LOADOUT.map((pick) =>
              h.li
                .key(pick.slot)
                .class(css({ display: "flex", alignItems: "baseline", gap: "1.5" }))
                .children(
                  h.span
                    .class(
                      css({ width: "3", flexShrink: "0", textAlign: "center", color: "pink.400" }),
                    )
                    .children(pick.glyph),
                  h.span
                    .class(
                      css({
                        flexShrink: "0",
                        fontSize: "9px",
                        letterSpacing: "wider",
                        color: "pink.950/55",
                        textTransform: "uppercase",
                      }),
                    )
                    .children(pick.slot),
                  h.span.attr("aria-hidden", "true").class(
                    css({
                      minWidth: "2",
                      flex: "1",
                      translate: "0 -3px",
                      borderBottomWidth: "1px",
                      borderStyle: "dotted",
                      borderColor: "pink.300",
                    }),
                  ),
                  h.span
                    .class(
                      css({ ...trunc, display: "block", minWidth: "0", fontWeight: "semibold" }),
                    )
                    .children(pick.name),
                ),
            ),
          ),
          h.p
            .class(
              css({
                mt: "auto",
                display: "flex",
                justifyContent: "space-between",
                borderTopWidth: "1px",
                borderStyle: "dashed",
                borderColor: "pink.200",
                pt: "1.5",
                fontSize: "10px",
                textTransform: "uppercase",
              }),
            )
            .children(h.span.children("Total"), h.span.children(`${items.length} things`)),
          h.span.attr("aria-hidden", "true").class(
            css({
              display: "block",
              height: "5",
              width: "full",
              backgroundImage:
                "repeating-linear-gradient(90deg, rgb(80 7 36) 0 1px, transparent 1px 3px, rgb(80 7 36) 3px 5px, transparent 5px 6px, rgb(80 7 36) 6px 7px, transparent 7px 10px)",
              opacity: "0.7",
            }),
          ),
        ),
    ],
  });
};

/** A small, stable number from a name, so every star keeps its place between builds. */
function seed(name: string): number {
  let hash = 2166136261;
  for (const c of name) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return hash >>> 0;
}

const STAR_TONES = [
  css({ bg: "yellow.300" }),
  css({ bg: "sky.300" }),
  css({ bg: "pink.300" }),
  css({ bg: "purple.300" }),
];

/**
 * Neighbours as a sky: one star per site, scattered round me in the middle. At
 * rest they are just dots. Hover draws the lines out to each of them, and a
 * star shows its name and opens the site. The lines are SVG; the stars are
 * HTML links laid over it at the same percentages, since Effect UI has no SVG
 * `<a>`.
 */
const NeighboursCell = <M>(h: Html.H<M>) => {
  const people = [...neighbours].sort((a, b) => a.name.localeCompare(b.name));
  const stars = people.map((person, i) => {
    const hash = seed(person.name);
    const angle = i * 2.39996 + ((hash % 100) / 100) * 0.7;
    const radius = 16 + (((hash >>> 8) % 100) / 100) * 30;
    // Rounded: Node and browsers disagree on the last digits of sin/cos,
    // which breaks hydration of the prerendered markup.
    return {
      ...person,
      x: Math.round((50 + Math.cos(angle) * radius) * 100) / 100,
      y: Math.round((50 + Math.sin(angle) * radius) * 100) / 100,
      size: 1.6 + ((hash >>> 16) % 3) * 0.5,
    };
  });
  const line = css({
    stroke: "sky.400/70",
    strokeWidth: "0.35",
    strokeDashoffset: "1",
    transition: "stroke-dashoffset 300ms ease-out",
    _groupHover: { strokeDashoffset: "0", transitionDelay: "var(--d)" },
  });
  return GCell(h, {
    linked: true,
    tone: "sky",
    style: css.raw({
      gridColumn: { base: "span 2", md: "span 1" },
      xl: { gridColumn: "6", gridRow: "4" },
    }),
    label: LabelLink(h, "/neighbours", "Neighbours"),
    // A square sky inside the cell, as the SVG's own box was.
    children: [
      h.div
        .class(
          css({
            pointerEvents: "none",
            position: "relative",
            zIndex: "10",
            minHeight: "28",
            flex: "1",
            display: "flex",
            justifyContent: "center",
          }),
        )
        .children(
          h.div
            .class(
              css({ position: "relative", height: "full", maxWidth: "full", aspectRatio: "1" }),
            )
            .children(
              h.svg
                .attrs({ viewBox: "0 0 100 100", "aria-label": `${people.length} sites` })
                .class(
                  css({
                    position: "absolute",
                    inset: "0",
                    width: "full",
                    height: "full",
                    overflow: "visible",
                  }),
                )
                .children(
                  stars.map((star, i) =>
                    h.line
                      .key(star.url)
                      .class(line)
                      .attrs({
                        x1: "50",
                        y1: "50",
                        x2: String(star.x),
                        y2: String(star.y),
                        pathLength: "1",
                        "stroke-dasharray": "1",
                      })
                      .style(stagger(i, 15)),
                  ),
                  h.circle.attrs({ cx: "50", cy: "50", r: "2.4" }).class(css({ fill: "pink.500" })),
                  h.circle
                    .attrs({ cx: "50", cy: "50", r: "4.5", "stroke-dasharray": "1.2 1.2" })
                    .class(css({ fill: "none", stroke: "pink.400/60", strokeWidth: "0.4" })),
                ),
              stars.map((star, i) =>
                h.a
                  .key(star.url)
                  .class(
                    css({
                      pointerEvents: "auto",
                      position: "absolute",
                      width: "10%",
                      height: "10%",
                      translate: "-50% -50%",
                      display: "grid",
                      placeItems: "center",
                      outline: "none",
                      "&:hover > .star, &:focus-visible > .star": { scale: "1.8" },
                      "&:hover > .name, &:focus-visible > .name": { opacity: "1" },
                    }),
                  )
                  .style({ left: `${star.x}%`, top: `${star.y}%` })
                  .attrs({ href: star.url, "aria-label": star.name, ...ext })
                  .children(
                    h.span
                      .class(
                        "star",
                        css({
                          display: "block",
                          rounded: "full",
                          border: "1px solid white",
                          transition: "scale 200ms ease-out",
                        }),
                        STAR_TONES[i % 4],
                      )
                      .style({ width: `${star.size * 20}%`, height: `${star.size * 20}%` }),
                    h.span
                      .class(
                        "name",
                        css({
                          position: "absolute",
                          bottom: "100%",
                          whiteSpace: "nowrap",
                          fontFamily: "mono",
                          fontSize: "9px",
                          color: "sky.900",
                          opacity: "0",
                          transition: "opacity 150ms",
                        }),
                      )
                      .children(star.name),
                  ),
              ),
            ),
        ),
    ],
  });
};

/**
 * The home page: the whole site as one bento box. Each compartment summarises
 * a page and opens it. `Status`, the last plays and the push tag read the
 * browser's clock and last.fm or GitHub, so the prerender draws them without
 * (`fallback`), and the browser fills them in.
 */
export const HomeGrid = <M>(
  h: Html.H<M>,
  options: { contributions: ContributionsResponse | null },
) =>
  Box(h, { dense: true }).children(
    IntroCell(h),
    StatusTile(h, { key: "status", fallback: () => StatusBoard(h, { activity: null, now: null }) }),
    ListeningCell(h, { key: "listening", fallback: () => ListeningEmpty(h, undefined, false) }),
    UsesCell(h),
    // On four columns, git, writing, and neighbours share one row at 3:3:1.
    // On two and six columns the wrapper drops out and they sit in the grid.
    h.div
      .class(
        css({
          display: "contents",
          md: {
            gridColumn: "span 4",
            display: "grid",
            gridTemplateColumns: "3fr 3fr 1fr",
            "& > *": { gridColumn: "span 1" },
          },
          xl: { display: "contents" },
        }),
      )
      .children(GitCell(h, options.contributions), WritingCell(h), NeighboursCell(h)),
    ProjectCells(h),
    ExperienceCell(h),
    OpenSourceCell(h),
  );
