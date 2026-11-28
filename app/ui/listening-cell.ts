import { Component } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { AsyncResult } from "effect/reactivity";
import { css } from "../../styled-system/css";
import type { LastFmTrack } from "../features/music/types";
import { GetRecentTracks } from "../queries/GetRecentTracks";
import { timeAgo } from "./based-row";
import type { Style } from "./box";
import { GCell, LabelLink, trunc } from "./gcell";

const LISTENING: Style = { xl: { gridColumn: "6", gridRow: "1 / 3" } };

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
