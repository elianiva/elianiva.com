import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";
import { cutouts, type Style } from "./box";

/** px; the icon stub's width, where the perforation and its punches sit. */
const STUB = 32;

/**
 * An app or company named in running text, as a small admission ticket: its
 * icon on a stub behind a dashed perforation, the name on the body, and a
 * notch punched in each end. Hovering lifts it and tilts it a little.
 */
export const AppPill = <M>(
  h: Html.H<M>,
  options: { name: string; href?: string; icon?: string; meta?: string; style?: Style },
) => {
  const { name, href, icon, meta, style } = options;
  const holes: [number, string][] = [
    [4, "0 50%"],
    [4, "100% 50%"],
    ...(icon
      ? ([
          [3, `${STUB}px 0`],
          [3, `${STUB}px 100%`],
        ] as [number, string][])
      : []),
  ];
  const root = (
    href ? h.a.attrs({ href, target: "_blank", rel: "noopener noreferrer" }) : h.span
  ).class(
    css(
      {
        position: "relative",
        zIndex: "10",
        mx: "0.5",
        display: "inline-block",
        verticalAlign: "middle",
        textDecoration: "none",
        filter: "drop-shadow(0 2px 0 rgb(244 114 182 / 0.35))",
        transition: "transform 200ms cubic-bezier(0.23, 1, 0.32, 1)",
      },
      href
        ? {
            _hover: { transform: "translateY(-0.125rem) rotate(-2deg)" },
            _active: { transform: "scale(0.97)" },
            "&:hover [data-pill-stub]": { bg: "pink.100" },
          }
        : undefined,
      style,
    ),
  );
  return root.children(
    h.span
      .class(
        css({
          display: "flex",
          height: "8",
          alignItems: "stretch",
          bg: "white",
          boxShadow: "inset 0 0 0 1px rgb(251 207 232)",
          fontSize: "14px",
          lineHeight: "none",
          fontWeight: "semibold",
          whiteSpace: "nowrap",
          color: "pink.950",
        }),
      )
      .style(cutouts(...holes))
      .children(
        icon
          ? h.span
              .attr("data-pill-stub", "")
              .class(
                css({
                  display: "grid",
                  flexShrink: "0",
                  placeItems: "center",
                  borderRightWidth: "1px",
                  borderRightStyle: "dashed",
                  borderColor: "pink.300",
                  bg: "pink.50",
                  transition: "background-color 200ms",
                }),
              )
              .style({ width: `${STUB}px` })
              .children(
                h.img
                  .attrs({
                    src: icon,
                    alt: "",
                    width: "24",
                    height: "24",
                    loading: "lazy",
                    decoding: "async",
                  })
                  .class(css({ width: "6", height: "6", objectFit: "contain" })),
              )
          : null,
        h.span
          .class(css({ display: "flex", alignItems: "center", gap: "1.5", pr: "3", pl: "2.5" }))
          .children(
            name,
            meta
              ? h.span
                  .class(
                    css({
                      fontFamily: "mono",
                      fontSize: "11px",
                      fontWeight: "normal",
                      color: "color-mix(in oklab, var(--colors-pink-950) 55%, transparent)",
                    }),
                  )
                  .children(meta)
              : null,
          ),
      ),
  );
};
