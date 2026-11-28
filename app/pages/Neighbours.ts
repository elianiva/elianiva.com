import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { css } from "../../styled-system/css";
import { neighbours } from "../data/neighbours";
import { seoHead, ogPageImageUrl } from "../lib/seo";
import { Box, Cell, stretched } from "../ui/box";
import { Fill, PageHead, STAMP_CYCLE, Stamp } from "../ui/pagehead";

const LETTER_TONES = [
  css({ color: "yellow.200" }),
  css({ color: "sky.200" }),
  css({ color: "pink.200" }),
  css({ color: "purple.200" }),
];

/** Each neighbour is a compartment with their initial set huge, like a letterpress block. */
export const Neighbours = Html.component({
  name: "Neighbours",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  head: () => [
    ...seoHead({
      title: "Neighbours",
      description: "Cool people I know on the web, go check them out!",
      ogImage: ogPageImageUrl("neighbours"),
      path: "/neighbours",
    }),
  ],
  view: (h) => {
    const people = [...neighbours].sort((a, b) => a.name.localeCompare(b.name));
    return Box(h).children(
      PageHead(h, {
        title: "Neighbours",
        tone: "sky",
        kicker: ["A bunch of cool people I know or have run into on the web. Go say hi."],
        aside: [
          h.p
            .class(
              css({
                mt: "auto",
                fontFamily: "display",
                fz: "7xl",
                lineHeight: "none",
                fontWeight: "extrabold",
                color: "pink.950",
                fontVariantNumeric: "tabular-nums",
              }),
            )
            .children(String(people.length)),
          h.p
            .class(css({ fontFamily: "mono", fontSize: "11px", color: "pink.950/60" }))
            .children("sites worth a visit"),
        ],
      }),
      people.map((person, i) =>
        Cell(h, {
          as: "article",
          style: css.raw({ overflow: "hidden" }),
          children: [
            h.span
              .attr("aria-hidden", "true")
              .class(
                css({
                  pointerEvents: "none",
                  position: "absolute",
                  right: "-3",
                  bottom: "-10",
                  fontFamily: "display",
                  fontSize: "11rem",
                  lineHeight: "none",
                  fontWeight: "extrabold",
                  transition: "transform 300ms cubic-bezier(0, 0, 0.2, 1)",
                }),
                LETTER_TONES[i % 4],
              )
              .children(person.name[0] ?? ""),
            h.a
              .attrs({ href: person.url, target: "_blank", rel: "noopener noreferrer" })
              .class(css({ mt: "auto" }, stretched))
              .children(
                Stamp(h, {
                  tone: STAMP_CYCLE[i % 4] ?? "yellow",
                  style: css.raw({ transition: "transform 300ms" }),
                  children: [
                    h.span
                      .class(css({ fontFamily: "display", fz: "base", fontWeight: "bold" }))
                      .children(person.name),
                  ],
                }),
                h.span
                  .class(
                    css({
                      position: "relative",
                      mt: "2",
                      display: "block",
                      truncate: true,
                      fontFamily: "mono",
                      fontSize: "11px",
                      color: "pink.950/70",
                    }),
                  )
                  .children(`${person.url.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗`),
              ),
          ],
        }).key(person.url),
      ),
      Fill(h, people.length),
    );
  },
});
