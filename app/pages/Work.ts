import type { Html as HtmlNs } from "@effect/ui/html";
import { Html } from "@effect/ui/html";
import { View } from "@effect/ui";
import { Schema } from "effect";
import { css } from "../../styled-system/css";
import siteData from "../data/sites";
import { openSource, prUrl } from "../data/open-source";
import { engagement, place, work, yearRange } from "../data/work-experience";
import { seoHead, ogPageImageUrl } from "../lib/seo";
import { AppPill } from "../ui/app-pill";
import { Box, Cell, type Style } from "../ui/box";
import { Fill, PageHead, Postmark } from "../ui/pagehead";

const month = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const fmt = (value: string | null) => (value ? month.format(new Date(`${value}-01`)) : "Now");

const LEG: Style = {
  fontFamily: "mono",
  fontSize: "9px",
  letterSpacing: "0.25em",
  color: "pink.950/45",
  textTransform: "uppercase",
};
const CODE: Style = {
  fontFamily: "display",
  fz: "2xl",
  lineHeight: "none",
  fontWeight: "extrabold",
  color: "pink.950",
  textTransform: "uppercase",
  fontVariantNumeric: "tabular-nums",
};
/** Irregular bars, so the strip reads as a barcode and not as stripes. */
const BARCODE =
  "repeating-linear-gradient(90deg, rgb(80 7 36) 0 1px, transparent 1px 3px, rgb(80 7 36) 3px 5px, transparent 5px 6px, rgb(80 7 36) 6px 7px, transparent 7px 9px, rgb(80 7 36) 9px 9.5px, transparent 9.5px 11px)";

/** `fix(ui)!: x` becomes `{ kind: "fix!", text: "x" }`. */
const parseTitle = (title: string) => {
  const match = title.match(/^(\w+)(?:\([^)]*\))?(!)?:\s*(.*)$/);
  if (!match) return { kind: "change", text: title };
  return { kind: `${match[1]}${match[2] ?? ""}`, text: match[3] ?? "" };
};

const Role = <M>(h: HtmlNs.H<M>, role: (typeof work)[number]) => {
  const current = role.period[1] === null;
  const logo = css({
    width: "11",
    height: "11",
    flexShrink: "0",
    border: "1px solid",
    borderColor: "pink.200",
    bg: "white",
  });
  return Cell(h, {
    as: "article",
    span: "w2",
    tone: current ? "white" : "paper",
    style: { gap: "4" },
    children: [
      current
        ? Postmark(h, {
            style: {
              position: "absolute",
              top: "3",
              right: "14",
              width: "11",
              height: "11",
              fontSize: "8px",
            },
            children: ["now"],
          })
        : null,
      h.div.class(css({ display: "flex", alignItems: "center", gap: "3.5" })).children(
        role.website
          ? h.img
              .attrs({ src: role.website.favicon, alt: "", width: "44", height: "44" })
              .class(logo, css({ objectFit: "contain", p: "1" }))
          : h.span
              .class(
                logo,
                css({
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "display",
                  fz: "lg",
                  fontWeight: "extrabold",
                  color: "pink.500",
                }),
              )
              .children(role.company[0] ?? ""),
        h.div.class(css({ minWidth: "0" })).children(
          h.h2
            .class(
              css({
                fontFamily: "display",
                fz: "xl",
                lineHeight: "tight",
                fontWeight: "extrabold",
                color: "pink.950",
              }),
            )
            .children(
              role.website
                ? h.a
                    .attrs({
                      href: role.website.href,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })
                    .class(css({ _hover: { color: "pink.600" } }))
                    .children(role.company)
                : role.company,
            ),
          h.p
            .class(css({ truncate: true, fz: "sm", color: "pink.950/65" }))
            .children(role.position),
        ),
      ),
      // From, to, and the details of the role.
      h.div
        .class(
          css({
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "flex-end",
            gap: "3",
          }),
        )
        .children(
          h.div.children(
            h.p.class(css(LEG)).children("From"),
            h.p.class(css(CODE)).children(fmt(role.period[0])),
          ),
          h.div
            .attr("aria-hidden", "true")
            .class(
              css({
                position: "relative",
                mb: "3",
                borderTopWidth: "2px",
                borderStyle: "dashed",
                borderColor: "pink.300",
              }),
            )
            .children(
              h.span
                .class(
                  css({
                    position: "absolute",
                    top: "-0.8em",
                    left: "50%",
                    translate: "-50% 0",
                    bg: "inherit",
                    px: "1",
                    fz: "sm",
                    color: "pink.500",
                  }),
                )
                .children("✈"),
            ),
          h.div
            .class(css({ textAlign: "right" }))
            .children(
              h.p.class(css(LEG)).children("To"),
              h.p.class(css(CODE, current && { color: "pink.600" })).children(fmt(role.period[1])),
            ),
        ),
      h.dl
        .class(
          css({
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "3",
            fontFamily: "mono",
            fontSize: "11px",
            color: "pink.950",
          }),
        )
        .children(
          (
            [
              ["Type", engagement(role)],
              ["Location", place(role)],
              ["Years", yearRange(role)],
            ] as const
          ).map(([term, value]) =>
            h.div
              .key(term)
              .class(css({ minWidth: "0" }))
              .children(
                h.dt.class(css(LEG)).children(term),
                h.dd.class(css({ truncate: true })).children(value),
              ),
          ),
        ),
      // Perforation: a dashed tear line with a notch cut at each edge.
      h.div
        .attr("aria-hidden", "true")
        .class(css({ position: "relative", mx: "-4", md: { mx: "-5" } }))
        .children(
          h.div.class(
            css({ borderTopWidth: "2px", borderStyle: "dashed", borderColor: "pink.200" }),
          ),
          h.span.class(notch({ left: "-2" })),
          h.span.class(notch({ right: "-2" })),
        ),
      h.ul.class(css({ display: "grid", gap: "1.5" })).children(
        role.details.map((detail) =>
          h.li
            .key(detail)
            .class(
              css({
                position: "relative",
                pl: "4",
                fontSize: "14px",
                lineHeight: "relaxed",
                color: "pink.950/80",
                _before: {
                  content: '""',
                  position: "absolute",
                  top: "0.6em",
                  left: "0",
                  width: "1.5",
                  height: "1.5",
                  bg: "pink.300",
                },
              }),
            )
            .children(detail),
        ),
      ),
      h.div
        .class(
          css({
            mt: "auto",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "4",
          }),
        )
        .children(
          h.p
            .class(css({ fontFamily: "mono", fontSize: "11px", color: "pink.500" }))
            .children(role.technologies.map((tech) => `#${tech}`).join(" ")),
          h.span
            .attr("aria-hidden", "true")
            .class(
              css({ display: "block", height: "6", width: "24", flexShrink: "0", opacity: 0.3 }),
            )
            .style({ backgroundImage: BARCODE }),
        ),
    ],
  });
};

const notch = (side: { left: "-2" } | { right: "-2" }) =>
  css(
    {
      position: "absolute",
      top: "50%",
      translate: "0 -50%",
      width: "4",
      height: "4",
      rounded: "full",
      border: "1px solid",
      borderColor: "pink.200",
      bg: "pink.50",
    },
    side,
  );

export const Work = Html.component({
  name: "Work",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  head: () => [
    ...seoHead({
      title: "Work",
      description: "Where I have worked, what I built there, and my open source contributions.",
      ogImage: ogPageImageUrl("work"),
      path: "/work",
    }),
  ],
  view: (h) => {
    const first = work.at(-1)?.period[0].slice(0, 4);
    const prs = openSource.reduce((sum, entry) => sum + entry.prs.length, 0);
    return Box(h, { square: false }).children(
      PageHead(h, {
        title: "Work",
        tone: "hot",
        kicker: [
          "I work at ",
          AppPill(h, {
            name: "Aerotalon",
            href: "https://aerotalon.com",
            icon: "/assets/company-favicons/aerotalon.jpg",
          }),
          " on aviation operations software. With AI making software cheaper to build, I think it\u2019s even more important to make it with care. I like fixing the things that frustrate people.",
        ],
        aside: [
          h.p
            .class(
              css({
                mt: "auto",
                fontFamily: "display",
                fz: "4xl",
                lineHeight: "none",
                fontWeight: "extrabold",
                whiteSpace: "nowrap",
                fontVariantNumeric: "tabular-nums",
                xl: { fontSize: "2.1rem" },
                "2xl": { fz: "4xl" },
              }),
            )
            .children(`${first}–now`),
          h.p
            .class(css({ fontFamily: "mono", fontSize: "11px", opacity: 0.85 }))
            .children(`${work.length} roles so far`),
          h.a
            .attr("href", siteData.cv)
            .class(
              css({
                position: "relative",
                zIndex: "10",
                border: "1px solid",
                borderColor: "white/60",
                px: "3",
                py: "2",
                textAlign: "center",
                fontFamily: "mono",
                fontSize: "11px",
                letterSpacing: "wider",
                textTransform: "uppercase",
                transition: "color 150ms, background-color 150ms",
                _hover: { bg: "white", color: "pink.700" },
              }),
            )
            .children("Download CV ↗"),
        ],
      }),
      work.map((role) => Role(h, role).key(role.company)),
      Fill(h, work.length * 2),
      Cell(h, {
        as: "header",
        span: "w4",
        tone: "lilac",
        style: {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "3",
          py: "6",
        },
        children: [
          h.h2
            .attr("id", "open-source")
            .class(
              css({
                scrollMarginTop: "6",
                fontFamily: "display",
                fz: "3xl",
                fontWeight: "extrabold",
                letterSpacing: "wide",
                color: "pink.950",
                textTransform: "uppercase",
                md: { fz: "4xl" },
              }),
            )
            .children(h.span.class(css({ color: "pink.500" })).children("O"), "pen source"),
          h.p
            .class(css({ fontFamily: "mono", fontSize: "11px", color: "pink.950/60" }))
            .children(`${prs} handpicked pull requests in ${openSource.length} projects`),
        ],
      }),
      openSource.map((entry) =>
        Cell(h, {
          span: "w2",
          label: View.text(entry.about),
          style: { gap: "3" },
          children: [
            h.a
              .attrs({
                href: `https://github.com/${entry.repo}`,
                target: "_blank",
                rel: "noopener noreferrer",
              })
              .class(
                css({
                  fontFamily: "mono",
                  fz: "lg",
                  color: "pink.700",
                  _hover: { color: "pink.950" },
                }),
              )
              .children(entry.repo),
            h.ul.class(css({ display: "grid" })).children(
              entry.prs.map((pr) => {
                const { kind, text } = parseTitle(pr.title);
                return h.li
                  .key(String(pr.number))
                  .class(
                    css({
                      borderTopWidth: "1px",
                      borderStyle: "dashed",
                      borderColor: "pink.200",
                      py: "2",
                      _first: { borderTopWidth: "0" },
                    }),
                  )
                  .children(
                    h.a
                      .attrs({
                        href: prUrl(entry.repo, pr.number),
                        target: "_blank",
                        rel: "noopener noreferrer",
                      })
                      .class(
                        css({
                          display: "block",
                          fz: "sm",
                          lineHeight: "snug",
                          color: "pink.950",
                          _hover: { color: "pink.600" },
                        }),
                      )
                      .children(
                        h.span
                          .class(css({ fontFamily: "mono", fontSize: "11px", color: "pink.500" }))
                          .children(`#${pr.number} ${kind}`),
                        " ",
                        text,
                        h.span
                          .class(
                            css({
                              mt: "0.5",
                              display: "block",
                              fontSize: "13px",
                              color: "pink.950/60",
                            }),
                          )
                          .children(pr.note),
                      ),
                  );
              }),
            ),
          ],
        }).key(entry.repo),
      ),
      Fill(h, openSource.length * 2),
    );
  },
});
