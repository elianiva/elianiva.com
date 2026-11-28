import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";
import { Box, Cell, stretched } from "./box";
import { Postmark } from "./pagehead";

const COPY = {
  page: "This page drifted off somewhere. The URL you opened does not exist here anymore.",
  post: "This post shelf is empty. Maybe it drifted out of the archive.",
  project: "This project has not materialized. Maybe check the project list again.",
} as const;

/**
 * The 404 compartment: a big number, a postmark, and the ways back. The page
 * sets its own title and `noindex` in its `head` (see `NotFound` in `App.ts`).
 */
export const LostPage = <M>(
  h: Html.H<M>,
  options: { section: keyof typeof COPY; home: "/" | "/posts" | "/projects" },
) => {
  const { section, home } = options;
  const to = home === "/" ? "/posts" : home;
  const hint = css({
    mt: "auto",
    fz: "sm",
    color: "color-mix(in oklab, var(--colors-pink-950) 70%, transparent)",
  });
  return Box(h).children(
    Cell(h, {
      span: "s2",
      tone: "white",
      style: { justifyContent: "space-between" },
      children: [
        Postmark(h, { style: { alignSelf: "flex-end" }, children: [h.text("return to sender")] }),
        h.p
          .class(
            css({
              fontFamily: "display",
              fontSize: "7rem",
              md: { fontSize: "10rem" },
              lineHeight: "none",
              fontWeight: "extrabold",
              color: "pink.950",
            }),
          )
          .children(h.span.class(css({ color: "pink.500" })).children("4"), "04"),
      ],
    }),
    Cell(h, {
      span: "w2",
      label: h.text("Lost in the blush"),
      style: { justifyContent: "flex-end", xl: { gridColumn: "span 4" } },
      children: [
        h.h1
          .class(
            css({
              fontFamily: "display",
              fz: "2xl",
              md: { fz: "3xl" },
              fontWeight: "bold",
              color: "pink.950",
              textWrap: "balance",
            }),
          )
          .children(COPY[section]),
      ],
    }),
    Cell(h, {
      linked: true,
      tone: "yellow",
      style: { xl: { gridColumn: "span 2" } },
      label: h.a.attr("href", "/").class(css(stretched)).children("Home"),
      children: [h.p.class(hint).children("Start from the top")],
    }),
    Cell(h, {
      linked: true,
      tone: "sky",
      style: { xl: { gridColumn: "span 2" } },
      label: h.a
        .attr("href", to)
        .class(css(stretched))
        .children(home === "/projects" ? "All projects" : "All posts"),
      children: [h.p.class(hint).children("Browse the index instead")],
    }),
  );
};
