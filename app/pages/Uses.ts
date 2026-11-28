import type { Html as HtmlNs } from "@effect/ui/html";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { css } from "../../styled-system/css";
import { uses, usesUpdatedAt, type UsesItem, type UsesSection } from "../data/uses";
import { seoHead, ogPageImageUrl } from "../lib/seo";
import { Box, Cell, type Style, type Tone } from "../ui/box";
import { PageHead } from "../ui/pagehead";
import { formatUtcDate } from "../lib/date";

const SECTION_TONES: Tone[] = ["yellow", "sky", "pink", "lilac"];

/** A group's spine spans as many rows as it has items (Panda needs literals). */
const SPINE_ROWS: Record<number, Style> = {
  1: css.raw({ gridColumn: { base: "span 2", md: "span 1" }, md: { gridRow: "span 1" } }),
  2: css.raw({ gridColumn: { base: "span 2", md: "span 1" }, md: { gridRow: "span 2" } }),
  3: css.raw({ gridColumn: { base: "span 2", md: "span 1" }, md: { gridRow: "span 3" } }),
  4: css.raw({ gridColumn: { base: "span 2", md: "span 1" }, md: { gridRow: "span 4" } }),
  5: css.raw({ gridColumn: { base: "span 2", md: "span 1" }, md: { gridRow: "span 5" } }),
  6: css.raw({ gridColumn: { base: "span 2", md: "span 1" }, md: { gridRow: "span 6" } }),
  7: css.raw({ gridColumn: { base: "span 2", md: "span 1" }, md: { gridRow: "span 7" } }),
  8: css.raw({ gridColumn: { base: "span 2", md: "span 1" }, md: { gridRow: "span 8" } }),
  9: css.raw({ gridColumn: { base: "span 2", md: "span 1" }, md: { gridRow: "span 9" } }),
  10: css.raw({ gridColumn: { base: "span 2", md: "span 1" }, md: { gridRow: "span 10" } }),
};

const ItemName = <M>(h: HtmlNs.H<M>, item: UsesItem) =>
  item.href
    ? h.a
        .attrs({ href: item.href, target: "_blank", rel: "noopener noreferrer" })
        .class(
          css({
            textDecoration: "underline",
            textDecorationColor: "pink.300",
            textDecorationThickness: "2px",
            textUnderlineOffset: "6px",
            _hover: { color: "pink.600", textDecorationColor: "pink.500" },
          }),
        )
        .children(
          item.name,
          h.span
            .attr("aria-hidden", "true")
            .class(
              css({
                ml: "0.5",
                verticalAlign: "super",
                fontFamily: "mono",
                fontSize: "10px",
                color: "pink.400",
              }),
            )
            .children("↗"),
        )
    : item.name;

/** One thing I use: who it is on the left, why I use it on the right. */
const Item = <M>(h: HtmlNs.H<M>, item: UsesItem) =>
  Cell(h, {
    as: "article",
    span: "w3",
    style: css.raw({ gap: "4", md: { flexDirection: "row", gap: "8" } }),
    children: [
      h.div.class(css({ md: { width: "56", flexShrink: "0" } })).children(
        h.h3
          .class(
            css({
              fontFamily: "display",
              fz: "xl",
              lineHeight: "tight",
              fontWeight: "extrabold",
              letterSpacing: "wide",
              color: "pink.950",
              textTransform: "uppercase",
              md: { fz: "2xl", lineHeight: "tight" },
            }),
          )
          .children(ItemName(h, item)),
        h.p
          .class(css({ mt: "2", fontFamily: "mono", fontSize: "11px", color: "pink.500" }))
          .children(item.spec),
        h.p
          .class(css({ mt: "2", fz: "sm", lineHeight: "relaxed", color: "pink.950/65" }))
          .children(item.note),
      ),
      item.why || item.swapFor
        ? h.div
            .class(
              css({
                borderTopWidth: "1px",
                borderStyle: "dashed",
                borderColor: "pink.200",
                pt: "3",
                md: { borderTopWidth: "0", borderLeftWidth: "1px", pt: "0", pl: "8" },
              }),
            )
            .children(
              item.why
                ? h.p
                    .class(
                      css({
                        fontSize: "15px",
                        lineHeight: "relaxed",
                        color: "pink.950/80",
                        textWrap: "pretty",
                      }),
                    )
                    .children(item.why)
                : null,
              item.swapFor
                ? h.p
                    .class(css({ mt: "3", fz: "sm", lineHeight: "relaxed", color: "pink.950/60" }))
                    .children(
                      h.span
                        .class(
                          css({
                            mr: "2",
                            display: "inline-block",
                            rotate: "-3deg",
                            bg: "pink.200",
                            px: "1.5",
                            fontFamily: "mono",
                            fontSize: "10px",
                            letterSpacing: "widest",
                            color: "pink.800",
                            textTransform: "uppercase",
                          }),
                        )
                        .children("swap"),
                      item.swapFor,
                    )
                : null,
            )
        : null,
    ],
  });

/**
 * A group's coloured spine runs down the left column beside its items, as
 * tall as all of them together. On phones it sits on top instead.
 */
const Section = <M>(h: HtmlNs.H<M>, section: UsesSection, index: number) => [
  Cell(h, {
    as: "header",
    tone: SECTION_TONES[index % 4] ?? "yellow",
    style: SPINE_ROWS[section.items.length],
    children: [
      h.div.class(css({ md: { position: "sticky", top: "6" } })).children(
        h.h2
          .class(
            css({
              fontFamily: "display",
              fz: "2xl",
              fontWeight: "extrabold",
              letterSpacing: "wide",
              color: "pink.950",
              textTransform: "uppercase",
            }),
          )
          .children(
            h.span.class(css({ color: "pink.500" })).children(section.title.slice(0, 1)),
            section.title.slice(1),
          ),
        h.p
          .class(
            css({
              mt: "1",
              fontFamily: "mono",
              fontSize: "11px",
              lineHeight: "relaxed",
              color: "pink.950/60",
            }),
          )
          .children(section.kicker),
      ),
    ],
  }),
  ...section.items.map((item) => Item(h, item).key(`${section.slug}:${item.name}`)),
];

const updated = formatUtcDate(usesUpdatedAt, { day: "numeric", month: "short", year: true });

export const Uses = Html.component({
  name: "Uses",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  head: () => [
    ...seoHead({
      title: "Uses",
      description: "Hardware, software, and camera gear I actually use, and why I picked it.",
      ogImage: ogPageImageUrl("uses"),
      path: "/uses",
    }),
  ],
  view: (h) => {
    const total = uses.reduce((sum, section) => sum + section.items.length, 0);
    return Box(h, { square: false }).children(
      PageHead(h, {
        title: "Uses",
        tone: "white",
        kicker: ["These are the things that I use on a daily basis, and reasons why I use them."],
        aside: [
          h.p
            .class(
              css({
                mt: "auto",
                fontFamily: "mono",
                fontSize: "11px",
                lineHeight: "relaxed",
                color: "pink.950/60",
              }),
            )
            .children(
              "updated ",
              h.span.class(css({ color: "pink.600" })).children(updated),
              h.span
                .class(css({ display: "block" }))
                .children(`${String(total).padStart(2, "0")} items across ${uses.length} groups`),
            ),
        ],
      }),
      uses.flatMap((section, index) => Section(h, section, index)),
    );
  },
});
