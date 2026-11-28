import type { View } from "@effect/ui";
import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";

type Level = 1 | 2 | 3 | 4 | 5 | 6;

const SIZE = {
  1: css({ fz: "2xl", md: { fz: "3xl" } }),
  2: css({ fz: "xl", md: { fz: "2xl" } }),
  3: css({ fz: "lg", md: { fz: "xl" } }),
  4: css({ fz: "base", md: { fz: "lg" } }),
  5: css({ fz: "sm", md: { fz: "base" } }),
  6: css({ fz: "xs", md: { fz: "sm" } }),
} as const;

const RULE_BOTTOM = {
  1: css({ bottom: "-1" }),
  2: css({ bottom: "-0.5" }),
  3: css({ bottom: "0" }),
  4: css({ bottom: "-1px" }),
} as const;

/** A section heading with a hairline, two pink ticks and a square marker. */
export const Heading = <M, C extends View.Children<M>>(
  h: Html.H<M>,
  options: { level: Level; right?: View.Content<M>; children: C },
) => {
  const { level, right, children } = options;
  const tag = `h${level}` as const;
  return h[tag]
    .class(
      css({
        display: "block",
        position: "relative",
        pl: "4",
        color: "pink.950",
        fontWeight: "extrabold",
        fontFamily: "display",
        letterSpacing: "wide",
        textTransform: "uppercase",
        mb: "2",
        py: "2",
        lineHeight: "1.5",
        _firstLetter: { color: "pink.500" },
      }),
      SIZE[level],
    )
    .children(
      h.div.class(
        css({
          position: "absolute",
          bg: "color-mix(in oklab, var(--colors-pink-200) 50%, transparent)",
          left: "0",
          right: "0",
          height: "1px",
          _before: {
            position: "absolute",
            content: '""',
            bg: "pink.200",
            left: "0",
            bottom: "0",
            width: "5ch",
            height: "0.5",
          },
          _after: {
            position: "absolute",
            content: '""',
            bg: "pink.300",
            left: "0",
            bottom: "0",
            width: "2ch",
            height: "0.5",
            zIndex: "20",
          },
        }),
        RULE_BOTTOM[(level > 3 ? 4 : level) as 1 | 2 | 3 | 4],
      ),
      // The marker sits beside the first line when the heading wraps.
      h.div.class(
        css({
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          left: "0",
          top: "2",
          height: "1lh",
          width: "2.5",
          _before: {
            content: '""',
            bg: "color-mix(in oklab, var(--colors-pink-200) 50%, transparent)",
            width: "2.5",
            height: "2.5",
          },
          _after: { content: '""', bg: "pink.200", width: "2.5", height: "2.5" },
        }),
      ),
      h.div
        .class(
          css({
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            width: "100%",
          }),
        )
        .children(
          h.span.children(children),
          right
            ? h.span
                .class(
                  css({
                    fontFamily: "mono",
                    fz: "xs",
                    fontWeight: "normal",
                    color: "color-mix(in oklab, var(--colors-pink-950) 30%, transparent)",
                    flexShrink: "0",
                  }),
                )
                .children(right)
            : null,
        ),
    );
};
