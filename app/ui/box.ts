import type { View } from "@effect/ui";
import type { Html } from "@effect/ui/html";
import { css, cx } from "../../styled-system/css";
import type { SystemStyleObject } from "../../styled-system/types";

/**
 * The site's one layout: a bento box. Every page is a `Box` of `Cell`s on a
 * 4-column grid (2 on phones, 6 from 1280px up, full width up to 1920px) with
 * shared hairlines and no gaps. On phones it runs edge to edge: the outer
 * hairlines fall off the screen. In a `square` box each row is as tall as a
 * column is wide, so a 1×1 cell is a square; rows still grow when their
 * content needs more room.
 *
 * Panda reads `css()` calls statically, so every style below is a literal
 * object. Pass extra styles to a primitive with `style` and they merge over its
 * own, with `css()` semantics (the later value wins).
 */

export type Style = SystemStyleObject;

/** The hairline between cells. */
export const ruleColor = "color-mix(in oklab, var(--colors-pink-400) 30%, transparent)";

/** The mono caption style of cell labels and small print. */
export const label: Style = {
  fontFamily: "mono",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  color: "color-mix(in oklab, var(--colors-pink-950) 55%, transparent)",
};

/**
 * Stretches a link over its whole cell. Put it on the cell's label link; any
 * other link or button inside the cell needs `relative` and `z-index: 10`.
 */
export const stretched: Style = {
  _after: { position: "absolute", inset: "0", zIndex: "0", content: '""' },
  _focusVisible: {
    outline: "none",
    _after: { outline: "2px solid", outlineColor: "pink.500", outlineOffset: "-4px" },
  },
};

/**
 * The paper colours of the old ticket stamps, each printed with its own
 * pattern (see `.pat-*` in `panda/global.ts`).
 */
export const TONES = {
  paper: {},
  white: { bg: "color-mix(in oklab, white 70%, transparent)" },
  graph: {
    className: "pat-graph",
    bg: "color-mix(in oklab, white 60%, transparent)",
    "--pat-ink": "rgb(251 207 232 / 0.35)",
  },
  dots: { className: "pat-dither", "--pat-ink": "rgb(244 114 182 / 0.1)" },
  yellow: {
    className: "pat-dither",
    bg: "color-mix(in oklab, var(--colors-yellow-50) 40%, transparent)",
    "--pat-ink": "rgb(250 204 21 / 0.14)",
  },
  sky: {
    className: "pat-lines",
    bg: "color-mix(in oklab, var(--colors-sky-50) 40%, transparent)",
    "--pat-ink": "rgb(125 211 252 / 0.14)",
  },
  pink: {
    className: "pat-fade",
    bg: "color-mix(in oklab, var(--colors-pink-50) 40%, transparent)",
    "--pat-ink": "rgb(236 72 153 / 0.08)",
  },
  lilac: {
    className: "pat-diag",
    bg: "color-mix(in oklab, var(--colors-purple-50) 40%, transparent)",
    "--pat-ink": "rgb(192 132 252 / 0.1)",
  },
  ink: {
    className: "pat-graph",
    bg: "pink.950",
    color: "pink.50",
    "--pat-ink": "rgb(255 255 255 / 0.04)",
  },
  hot: {
    className: "pat-fade",
    bg: "pink.600",
    color: "white",
    "--pat-ink": "rgb(255 255 255 / 0.16)",
  },
  /** hot's dotted fade, in a quiet plum. */
  dusk: {
    className: "pat-fade",
    bg: "#4a1630",
    color: "pink.50",
    "--pat-ink": "rgb(244 114 182 / 0.2)",
  },
  /** An empty compartment: diagonal pencil hatching instead of a blank hole. */
  hatch: { className: "pat-diag", "--pat-ink": "rgb(251 207 232 / 0.4)" },
} as const;
export type Tone = keyof typeof TONES;

/** A tone's classes: its pattern class plus its Panda styles. */
export const tone = (name: Tone): string => {
  const { className, ...style } = TONES[name] as { className?: string } & Style;
  return cx(className, css(style));
};

const SPANS = {
  "1": {},
  w2: { gridColumn: "span 2" },
  /** The rest of a row after one cell: 3 of 4 columns, 5 of 6. */
  w3: { gridColumn: { base: "span 2", md: "span 3", xl: "span 5" } },
  /** A whole row. */
  w4: { gridColumn: { base: "span 2", md: "span 4", xl: "span 6" } },
  s2: { gridColumn: "span 2", gridRow: "span 2" },
  t2: { gridRow: "span 2" },
} as const satisfies Record<string, Style>;
export type Span = keyof typeof SPANS;

/** A hairline-bordered grid. Children are `Cell`s. */
export const Box = <M>(
  h: Html.H<M>,
  options: {
    /** Let later cells fill holes left earlier in the flow. */
    dense?: boolean;
    /** Square rows (the default). */
    square?: boolean;
    /** The box opens with a `PageHead` and this many more content-sized rows. */
    head?: number;
    label?: string;
    style?: Style;
  } = {},
) => {
  const { dense = false, square = true, head, label: aria, style } = options;
  const grid = h.div
    .class(
      css(
        {
          display: "grid",
          gridTemplateColumns: {
            base: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
            xl: "repeat(6, 1fr)",
          },
          bg: "color-mix(in oklab, #fff8f4 80%, transparent)",
          borderColor: ruleColor,
          md: { borderTopWidth: "1px", borderLeftWidth: "1px" },
          mdDown: { width: "calc(100% + 1px)" },
        },
        dense && { gridAutoFlow: "row dense" },
        // PageHead stacks into two rows on mobile and sits on one row from md up.
        head !== undefined && {
          gridTemplateRows: {
            base: `repeat(${2 + head}, auto)`,
            md: `repeat(${1 + head}, auto)`,
          },
        },
        square && {
          gridAutoRows: {
            base: "minmax(50cqw, auto)",
            md: "minmax(25cqw, auto)",
            xl: "minmax(calc(100cqw / 6), auto)",
          },
        },
      ),
      "cells-enter",
    )
    .attr("aria-label", aria);
  const frame = h.div.class(
    css(
      {
        containerType: "inline-size",
        mx: "auto",
        width: "100%",
        maxWidth: "1920px",
        mdDown: { overflow: "hidden" },
        md: { px: "4" },
      },
      style,
    ),
  );
  // The caller's children land on the grid, which sits inside the container frame.
  return grid.forward((cells) => frame.children(cells));
};

type CellTag = "section" | "article" | "div" | "header" | "aside" | "nav" | "li";

/**
 * One compartment of a `Box`. `label` is the mono caption: pass a link with
 * `stretched` styles and set `linked` to make the whole cell open it.
 */
export const Cell = <M, C extends View.Children<M>>(
  h: Html.H<M>,
  options: {
    span?: Span;
    tone?: Tone;
    label?: View.Content<M>;
    linked?: boolean;
    as?: CellTag;
    style?: Style;
    children?: C;
  } = {},
) => {
  const {
    span = "1",
    tone: toneName = "paper",
    label: caption,
    linked = false,
    as = "section",
    style,
    children,
  } = options;
  const dark = toneName === "ink" || toneName === "hot" || toneName === "dusk";
  const head =
    caption || linked
      ? h.div
          .class(
            css({
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "3",
            }),
          )
          .children(
            caption
              ? h.h2
                  .class(css(label, dark && { color: "currentColor", opacity: 0.75 }))
                  .children(caption)
              : h.span,
            linked
              ? h.span.class(css({ color: dark ? "currentColor" : "pink.400" })).children("↗")
              : null,
          )
      : null;
  const cell = h[as].class(
    css(
      {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "3",
        minWidth: "0",
        borderRightWidth: "1px",
        borderBottomWidth: "1px",
        borderColor: ruleColor,
        p: "4",
        md: { p: "5" },
      },
      SPANS[span],
      // Hovered, a linked cell's paper drifts and a perforation cuts in round
      // its edge, as if it were about to be torn off.
      linked && {
        outline: "2px dashed transparent",
        transition: "outline-color 200ms, outline-offset 200ms, filter 200ms",
        _hover: {
          outlineOffset: "-4px",
          ...(dark
            ? { filter: "brightness(1.1)", outlineColor: "rgb(255 255 255 / 0.45)" }
            : { outlineColor: "pink.300" }),
        },
      },
      style,
    ),
    tone(toneName),
    linked && "pat-live",
  );
  return children === undefined ? cell.children(head) : cell.children(head, children);
};

/**
 * A mask that punches round holes: each `[radius, "x y"]` removes one circle,
 * as on a punched or perforated ticket. Pass the result to `.style(...)`.
 */
export const cutouts = (...holes: [number, string][]) => {
  const layers = holes
    .map(([r, at]) => `radial-gradient(circle ${r}px at ${at}, #0000 97%, #000)`)
    .join(", ");
  return {
    maskImage: layers,
    WebkitMaskImage: layers,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
};

/** Irregular bars, so a strip reads as a barcode and not as stripes. */
export const BARCODE =
  "repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 3px, currentColor 3px 5px, transparent 5px 6px, currentColor 6px 7px, transparent 7px 9px, currentColor 9px 9.5px, transparent 9.5px 11px)";
