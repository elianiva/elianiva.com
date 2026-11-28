import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";

/** The pink border and the two paper tabs pinned to the window's corner (md and up). */
export const Frame = <M>(h: Html.H<M>) => {
  const edge = css.raw({
    display: "none",
    md: { display: "block" },
    position: "fixed",
    bg: "pink.200",
    zIndex: "50",
  });
  return [
    h.div.class(css(edge, { top: "0", left: "0", right: "0", height: "2" })),
    h.div.class(css(edge, { top: "0", bottom: "0", right: "0", width: "2" })),
    h.div.class(css(edge, { bottom: "0", left: "0", right: "0", height: "2" })),
    h.div.class(css(edge, { top: "0", left: "0", bottom: "0", width: "2" })),
    h.div.class(
      css({
        display: "none",
        md: { display: "block" },
        position: "fixed",
        top: "0",
        left: "0",
        width: "40",
        height: "4",
        bg: "sky.200",
        zIndex: "50",
        border: "2px solid",
        borderColor: "pink.200",
        borderTopWidth: "0",
        borderLeftWidth: "0",
      }),
    ),
    h.div.class(
      css({
        display: "none",
        md: { display: "flex" },
        position: "fixed",
        top: "0",
        left: "0",
        width: "20",
        height: "6",
        bg: "yellow.300",
        zIndex: "50",
        cursor: "pointer",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid",
        borderColor: "pink.200",
        borderTopWidth: "0",
        borderLeftWidth: "0",
      }),
    ),
  ];
};
