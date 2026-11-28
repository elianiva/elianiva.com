import type { View } from "@effect/ui";
import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";
import { Cell, ruleColor, tone, type Style, type Tone } from "./box";

/**
 * The first row of every page: the title compartment and a side compartment
 * for the page's numbers. The title's first letter is pink, as it always was.
 */
export const PageHead = <M, K extends View.Children<M>, A extends View.Children<M>>(
  h: Html.H<M>,
  options: { title: string; kicker?: K; tone?: Tone; aside: A },
) => {
  const { title, kicker, tone: toneName = "yellow", aside } = options;
  return [
    Cell(h, {
      as: "header",
      span: "w3",
      style: { justifyContent: "flex-end", gap: "2", py: "8", md: { py: "10" } },
      children: [
        h.h1
          .class(
            css({
              fontFamily: "display",
              fz: "5xl",
              lineHeight: "none",
              fontWeight: "extrabold",
              letterSpacing: "wide",
              color: "pink.950",
              textTransform: "uppercase",
              md: { fz: "7xl", lineHeight: "none" },
            }),
          )
          .children(
            h.span.class(css({ color: "pink.500" })).children(title.slice(0, 1)),
            title.slice(1),
          ),
        kicker
          ? h.p
              .class(
                css({
                  fz: "base",
                  lineHeight: "relaxed",
                  color: "color-mix(in oklab, var(--colors-pink-950) 75%, transparent)",
                  textWrap: "pretty",
                  md: { fz: "lg", lineHeight: "relaxed" },
                }),
              )
              .children(kicker)
          : null,
      ],
    }),
    Cell(h, {
      as: "aside",
      tone: toneName,
      style: {
        gridColumn: { base: "span 2", md: "span 1" },
        justifyContent: "space-between",
      },
      children: aside,
    }),
  ];
};

/**
 * Hatched cells that close the last row of a box, so a short row never leaves
 * a hole without hairlines. `used` counts the columns the cells before it take
 * in the run; each breakpoint (2, 4, and 6 columns) fills its own remainder.
 */
export const Fill = <M>(h: Html.H<M>, used: number) => {
  const left = (cols: number) => (cols - (used % cols)) % cols;
  const base: Style = { borderRightWidth: "1px", borderBottomWidth: "1px", borderColor: ruleColor };
  const fills: { n: number; show: Style }[] = [
    { n: left(2), show: { display: { base: "block", md: "none" } } },
    { n: left(4), show: { display: { base: "none", md: "block", xl: "none" } } },
    { n: left(6), show: { display: { base: "none", xl: "block" } } },
  ];
  return fills.map(({ n, show }, i) =>
    n > 0
      ? h.div
          .key(`fill-${i}`)
          .class(css(base, show), tone("hatch"))
          .attr("aria-hidden", "true")
          .style({ gridColumn: `span ${n}` })
      : null,
  );
};

const NOTCH =
  "radial-gradient(circle 5px at 0 50%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 5px at 100% 50%, #0000 98%, #000) right / 51% 100% no-repeat";

const STAMP_TONES = {
  yellow: "yellow.200",
  sky: "sky.200",
  pink: "pink.200",
  lilac: "purple.200",
  white: "white",
} as const;
export type StampTone = keyof typeof STAMP_TONES;
export const STAMP_CYCLE: StampTone[] = ["yellow", "sky", "pink", "lilac"];

/** A notched paper ticket stamp, the site's signature shape. */
export const Stamp = <M, C extends View.Children<M>>(
  h: Html.H<M>,
  options: { tone?: StampTone; style?: Style; children: C },
) => {
  const { tone: name = "yellow", style, children } = options;
  return h.span
    .class(
      css(
        { display: "inline-block", filter: "drop-shadow(0 2px 0 rgb(244 114 182 / 0.35))" },
        style,
      ),
    )
    .children(
      h.span
        .class(
          css({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            px: "3.5",
            pt: "1.5",
            pb: "2",
            color: "pink.950",
            bg: STAMP_TONES[name],
          }),
        )
        .style({ mask: NOTCH, webkitMask: NOTCH })
        .children(children),
    );
};

/** A dashed rubber-stamp circle, tilted, for dates and "here" marks. */
export const Postmark = <M, C extends View.Children<M>>(
  h: Html.H<M>,
  options: { style?: Style; children: C },
) =>
  h.span
    .class(
      css(
        {
          display: "grid",
          width: "16",
          height: "16",
          flexShrink: "0",
          rotate: "12deg",
          placeItems: "center",
          rounded: "full",
          border: "2px dashed",
          borderColor: "color-mix(in oklab, var(--colors-pink-500) 70%, transparent)",
          textAlign: "center",
          fontFamily: "mono",
          fontSize: "9px",
          lineHeight: "tight",
          fontWeight: "bold",
          textTransform: "uppercase",
          color: "color-mix(in oklab, var(--colors-pink-500) 90%, transparent)",
        },
        options.style,
      ),
    )
    .children(h.span.children(options.children));
