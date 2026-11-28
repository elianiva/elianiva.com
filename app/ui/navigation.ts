import { Mount } from "@effect/ui";
import type { Html } from "@effect/ui/html";
import { Effect, Schema, Stream } from "effect";
import { css } from "../../styled-system/css";
import { BARCODE, Box, Cell, cutouts } from "./box";

/** Each page and its three-letter route code, printed faintly on its ticket like a destination. */
const NAV_ITEMS = [
  { label: "Home", href: "/", code: "HOM" },
  { label: "Posts", href: "/posts", code: "PST" },
  { label: "Projects", href: "/projects", code: "PRJ" },
  { label: "Work", href: "/work", code: "WRK" },
  { label: "Music", href: "/music", code: "MSC" },
  { label: "Uses", href: "/uses", code: "USE" },
  { label: "Neighbours", href: "/neighbours", code: "NBR" },
] as const;

/** The paper of the current page's ticket, cycling by position. */
const TICKET_TONES = [
  css({ bg: "yellow.200" }),
  css({ bg: "sky.200" }),
  css({ bg: "pink.200" }),
  css({ bg: "purple.200" }),
];
const STUB = 26; // px; the perforation sits on this line

const isActiveFor = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

const ticketMask = (punched: boolean) =>
  cutouts(
    [5, "0 50%"],
    [5, "100% 50%"],
    [4, `${STUB}px 0`],
    [4, `${STUB}px 100%`],
    ...(punched ? ([[3.5, "calc(100% - 13px) 12px"]] as [number, string][]) : []),
  );

/**
 * On phones the strip scrolls sideways: whenever the path changes, bring the
 * current page's ticket to the middle of it.
 */
export const CenterCurrent = Mount.makeStream(
  "CenterCurrent",
  { args: { path: Schema.String } },
  (list: HTMLElement, _args, changes) =>
    changes.pipe(
      Stream.mapEffect(() =>
        Effect.sync(() => {
          const current = list.querySelector<HTMLElement>("li:has([aria-current=page])");
          if (!current || list.scrollWidth <= list.clientWidth) return;
          const left = current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2;
          list.scrollTo({ left, behavior: "smooth" });
        }),
      ),
      Stream.drain,
    ),
);

const Ticket = <M>(
  h: Html.H<M>,
  ticket: { label: string; code: string; n: number; active: boolean },
) => {
  const { label, code, n, active } = ticket;
  return h.span
    .class(
      css(
        {
          display: "block",
          filter: "drop-shadow(0 2px 0 rgb(244 114 182 / 0.4))",
          transition: "transform 200ms",
        },
        active
          ? { transform: "translateY(-0.25rem) rotate(-6deg)" }
          : {
              "[data-ticket-link]:hover > &, [data-ticket-link]:focus-visible > &": {
                transform: "translateY(-0.375rem) rotate(2deg)",
              },
            },
      ),
    )
    .children(
      h.span
        .class(
          css(
            {
              position: "relative",
              display: "flex",
              height: "3.25rem",
              width: "100%",
              color: "pink.950",
            },
            active ? undefined : { bg: "white" },
          ),
          active && TICKET_TONES[n % 4],
        )
        .style(ticketMask(active))
        .children(
          h.span
            .class(
              css({
                display: "grid",
                flexShrink: "0",
                placeItems: "center",
                borderRightWidth: "1px",
                borderRightStyle: "dashed",
                borderColor: "pink.950/25",
                fontFamily: "mono",
                fontSize: "8px",
                letterSpacing: "widest",
                color: "pink.950/50",
                writingMode: "vertical-rl",
              }),
            )
            .style({ width: `${STUB}px` })
            .children(
              h.span
                .class(css({ rotate: "180deg" }))
                .children(`No.${String(n + 1).padStart(2, "0")}`),
            ),
          h.span
            .class(
              css({
                position: "relative",
                display: "flex",
                flex: "1",
                flexDirection: "column",
                justifyContent: "center",
                gap: "1",
                pr: "4",
                pl: "2.5",
              }),
            )
            .children(
              h.span
                .attr("aria-hidden", "true")
                .class(
                  css({
                    position: "absolute",
                    right: "3",
                    bottom: "1.5",
                    display: "none",
                    "@container (min-width: 65rem)": { display: "block" },
                    fontFamily: "display",
                    fz: "xl",
                    lineHeight: "none",
                    fontWeight: "extrabold",
                    letterSpacing: "wider",
                    opacity: "0.1",
                  }),
                )
                .children(code),
              h.span
                .class(
                  css(
                    {
                      fontFamily: "heading",
                      fontSize: "11px",
                      lineHeight: "none",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                    },
                    active ? { fontWeight: "bold" } : { color: "pink.950/75" },
                  ),
                )
                .children(label),
              h.span
                .attr("aria-hidden", "true")
                .class(
                  css(
                    { display: "block", height: "2", width: "100%", maxWidth: "16" },
                    active ? { opacity: "0.6" } : { opacity: "0.25" },
                  ),
                )
                .style({ backgroundImage: BARCODE }),
            ),
        ),
    );
};

/**
 * The top tray: one big ticket with my handle and a stub that tilts as if
 * about to tear, then a strip of perforated tickets, one per page. The
 * current page's ticket is torn off, punched, and postmarked. On phones the
 * strip scrolls sideways and keeps it in view.
 */
export const NavigationStrip = <M>(h: Html.H<M>, options: { path: string }) => {
  const { path } = options;
  return h.header.class(css({ md: { pt: "4" } })).children(
    Box(h, { square: false }).children(
      Cell(h, {
        tone: "yellow",
        style: css.raw({
          justifyContent: "center",
          px: "2.5",
          py: "2",
          gridColumn: "span 2",
          md: { gridColumn: "span 1", px: "3", py: "2" },
        }),
        children: [
          h.a
            .attrs({ href: "/", "aria-label": "elianiva, home", "data-stub-link": "" })
            .class(
              css({
                display: "flex",
                height: "100%",
                minHeight: "14",
                filter: "drop-shadow(0 2px 0 rgb(244 114 182 / 0.4))",
                _focusVisible: { outline: "none" },
              }),
            )
            .children(
              h.span
                .class(
                  css({
                    display: "flex",
                    minWidth: "0",
                    flex: "1",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    bg: "white",
                    py: "2.5",
                    pr: "3",
                    pl: "4",
                  }),
                )
                .style(cutouts([6, "0 50%"], [5, "100% 0"], [5, "100% 100%"]))
                .children(
                  h.span
                    .class(
                      css({
                        fontFamily: "mono",
                        fontSize: "8px",
                        letterSpacing: "0.3em",
                        color: "pink.500",
                        textTransform: "uppercase",
                      }),
                    )
                    .children("elianiva.com"),
                  h.span
                    .class(
                      css({
                        fontFamily: "display",
                        fz: "2xl",
                        lineHeight: "none",
                        fontWeight: "extrabold",
                        letterSpacing: "wide",
                        color: "pink.950",
                        textTransform: "uppercase",
                      }),
                    )
                    .children(h.span.class(css({ color: "pink.500" })).children("e"), "lianiva"),
                  h.span
                    .attr("aria-hidden", "true")
                    .class(
                      css({
                        display: "block",
                        height: "1.5",
                        width: "100%",
                        maxWidth: "40",
                        opacity: "0.25",
                      }),
                    )
                    .style({ backgroundImage: BARCODE }),
                ),
              h.span
                .class(
                  css({
                    position: "relative",
                    display: "grid",
                    width: "11",
                    flexShrink: "0",
                    transformOrigin: "top left",
                    placeItems: "center",
                    borderLeftWidth: "2px",
                    borderLeftStyle: "dashed",
                    borderColor: "pink.950/20",
                    bg: "yellow.200",
                    transition: "transform 200ms",
                    "[data-stub-link]:hover > &, [data-stub-link]:focus-visible > &": {
                      rotate: "5deg",
                    },
                    "[data-stub-link]:active > &": { rotate: "9deg" },
                  }),
                )
                .style(cutouts([5, "0 0"], [5, "0 100%"], [6, "100% 50%"], [3.5, "50% 18%"]))
                .children(
                  h.span
                    .class(
                      css({
                        rotate: "180deg",
                        fontFamily: "mono",
                        fontSize: "8px",
                        letterSpacing: "0.25em",
                        color: "pink.950/60",
                        writingMode: "vertical-rl",
                      }),
                    )
                    .children("No.0001"),
                ),
            ),
        ],
      }),
      Cell(h, {
        as: "nav",
        span: "w3",
        style: css.raw({ justifyContent: "center", p: "0", md: { p: "0" } }),
        // The strip is the query container for the route codes: they print
        // once every ticket has room for one. Keeping the container here
        // rather than on each ticket lets the tickets size to their labels
        // and scroll on narrow screens instead of collapsing.
        children: [
          h.ul
            .attr("aria-label", "Main")
            .onMount(CenterCurrent({ path }))
            .class(
              css({
                containerType: "inline-size",
                display: "flex",
                scrollSnapType: "x mandatory",
                alignItems: "center",
                gap: "1",
                overflowX: "auto",
                px: "3",
                pt: "3",
                pb: "2",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }),
            )
            .children(
              NAV_ITEMS.map((item, i) => {
                const active = isActiveFor(path, item.href);
                return h.li
                  .key(item.href)
                  .class(
                    css(
                      {
                        position: "relative",
                        flexShrink: "0",
                        scrollSnapAlign: "center",
                        md: { minWidth: "max-content", flex: "1" },
                      },
                      active && { zIndex: "10" },
                    ),
                  )
                  .children(
                    h.a
                      .attrs({ href: item.href, "data-ticket-link": "" })
                      .attr("aria-current", active ? "page" : undefined)
                      .class(css({ display: "block", _focusVisible: { outline: "none" } }))
                      .children(Ticket(h, { label: item.label, code: item.code, n: i, active })),
                    active
                      ? h.span
                          .attr("aria-hidden", "true")
                          .class(
                            css({
                              pointerEvents: "none",
                              position: "absolute",
                              top: "-3.5",
                              right: "-1.5",
                              display: "grid",
                              width: "8",
                              height: "8",
                              rotate: "12deg",
                              placeItems: "center",
                              rounded: "full",
                              border: "2px dashed",
                              borderColor: "pink.500/75",
                              fontFamily: "mono",
                              fontSize: "7px",
                              lineHeight: "none",
                              fontWeight: "bold",
                              color: "pink.500/85",
                            }),
                          )
                          .children("HERE")
                      : null,
                  );
              }),
            ),
        ],
      }),
    ),
  );
};
