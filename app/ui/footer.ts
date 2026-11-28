import { Mount, UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Effect, Schema } from "effect";
import { css } from "../../styled-system/css";
import { Box, Cell } from "./box";
import { formatCount, formatUtcDate } from "../lib/date";

const BuildDateMessage = UiSchema.TaggedEnum({ Stamped: { value: Schema.String } });

/** Reads the clock in the browser, so the prerendered page carries no build-time date. */
const StampBuildDate = Mount.make("StampBuildDate", {}, (_node: HTMLElement) =>
  Effect.sync(() =>
    new Date().toLocaleString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }),
  ),
);

/** The date's markup alone, for a static page where `app/static.ts` fills in the clock. */
export const BuildDateText = <M>(h: Html.H<M>, value = "") =>
  h.span
    .attr("data-build-date", "")
    .class(
      css({
        fontFamily: "mono",
        fontSize: "10px",
        color: "color-mix(in oklab, var(--colors-pink-950) 45%, transparent)",
      }),
    )
    .children(value || "\u00a0");

/** The visitor's local date and time, filled in once the page is in the browser. */
export const BuildDate = Html.component({
  name: "BuildDate",
  model: Schema.String,
  message: BuildDateMessage,
}).make({
  init: () => "",
  update: (_$, message) => BuildDateMessage.match(message, { Stamped: ({ value }) => value }),
  view: (h, value) =>
    BuildDateText(h, value).onMount(
      StampBuildDate().pipe(Mount.map((v) => BuildDateMessage.Stamped({ value: v }))),
    ),
});

const REPO = "https://github.com/elianiva/elianiva.com";
const KIND_TONES: Record<string, string> = {
  feat: css({ bg: "pink.200" }),
  fix: css({ bg: "sky.200" }),
  chore: css({ bg: "yellow.200" }),
};
const OTHER_KIND_TONE = css({ bg: "purple.200" });
// UTC, so the prerendered date matches the browser's.
const receiptDate = {
  format: (d: Date | string | number) => formatUtcDate(d, { day: "2-digit", month: "short" }),
};

/** `fix(dev): x` becomes `{ kind: "fix", text: "x" }`. */
const parseSubject = (subject: string) => {
  const match = subject.match(/^(\w+)(?:\([^)]*\))?!?:\s*(.*)$/);
  return match ? { kind: match[1]!, text: match[2]! } : { kind: "misc", text: subject };
};

const dashed = {
  borderTopWidth: "1px",
  borderTopStyle: "dashed",
  borderColor: "pink.200",
} as const;

/**
 * The site's own changelog as a till receipt: the latest commits, one line
 * each with the date, the kind of change, and the hash, then the running
 * total. Read from git at build time, so it costs nothing in the browser.
 */
const ChangelogCell = <M>(h: Html.H<M>) => {
  const { total, commits } = __SITE_HISTORY__;
  return Cell(h, {
    span: "w2",
    tone: "white",
    label: h.text("Changelog"),
    style: css.raw({ gap: "0", md: { gridColumn: "span 3" }, xl: { gridColumn: "span 5" } }),
    children: [
      h.ol
        .class(
          css({
            mt: "2",
            display: "flex",
            flexDirection: "column",
            fontFamily: "mono",
            fontSize: "11px",
            color: "pink.950",
          }),
        )
        .children(
          commits.map((commit, i) => {
            const { kind, text } = parseSubject(commit.subject);
            return h.li
              .key(commit.hash)
              .class(
                css(
                  { display: "flex", alignItems: "baseline", gap: "2.5", py: "1.5" },
                  i > 0 && dashed,
                ),
              )
              .children(
                h.span
                  .class(
                    css({
                      width: "12",
                      flexShrink: "0",
                      color: "pink.950/50",
                      textTransform: "uppercase",
                      fontVariantNumeric: "tabular-nums",
                    }),
                  )
                  .children(receiptDate.format(new Date(commit.date))),
                h.span
                  .class(
                    css({
                      width: "12",
                      flexShrink: "0",
                      px: "1",
                      textAlign: "center",
                      fontSize: "9px",
                      letterSpacing: "wider",
                      textTransform: "uppercase",
                    }),
                    KIND_TONES[kind] ?? OTHER_KIND_TONE,
                  )
                  .children(kind),
                h.span
                  .class(
                    css({
                      minWidth: "0",
                      flex: "1",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontFamily: "sans",
                      fontSize: "13px",
                    }),
                  )
                  .children(text),
                h.a
                  .attrs({
                    href: `${REPO}/commit/${commit.hash}`,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })
                  .class(
                    css({
                      flexShrink: "0",
                      color: "pink.500",
                      textDecoration: "underline",
                      textDecorationStyle: "dotted",
                      textUnderlineOffset: "2px",
                      _hover: { color: "pink.700" },
                    }),
                  )
                  .children(commit.hash),
              );
          }),
        ),
      h.div
        .class(
          css({
            mt: "auto",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "4",
            pt: "2",
            fontFamily: "mono",
            fontSize: "10px",
            textTransform: "uppercase",
            ...dashed,
          }),
        )
        .children(
          h.span.children(
            "Total ",
            h.span.class(css({ color: "pink.600" })).children(formatCount(total)),
            " commits",
          ),
          h.span
            .attr("aria-hidden", "true")
            .class(css({ display: "block", height: "5", width: "28", opacity: "0.6" }))
            .style({
              backgroundImage:
                "repeating-linear-gradient(90deg,rgb(80 7 36) 0 1px,transparent 1px 3px,rgb(80 7 36) 3px 5px,transparent 5px 6px,rgb(80 7 36) 6px 7px,transparent 7px 10px)",
            }),
        ),
    ],
  });
};

/** The bottom tray: the site's changelog and the colophon. */
export const Footer = <M>(h: Html.H<M>, options: { static?: boolean } = {}) =>
  h.footer
    .class(
      css({
        pb: "env(safe-area-inset-bottom)",
        md: { mt: "-1px", pb: "14" },
      }),
    )
    .children(
      Box(h, { square: false }).children(
        ChangelogCell(h),
        Cell(h, {
          tone: "pink",
          style: css.raw({
            justifyContent: "space-between",
            gap: "4",
            mdDown: { gridColumn: "span 2" },
          }),
          children: [
            h.p
              .class(css({ fz: "sm", color: "pink.950/65" }))
              .children(
                "made with actual care ",
                h.span
                  .class(css({ color: "pink.950/40" }))
                  .children("(and probably too much coffee)"),
              ),
            h.div.class(css({ display: "flex", flexDirection: "column", gap: "1" })).children(
              h.p
                .class(
                  css({
                    fontFamily: "mono",
                    fontSize: "10px",
                    letterSpacing: "0.18em",
                    color: "pink.950/50",
                    textTransform: "uppercase",
                  }),
                )
                .children("effect ui · panda css"),
              options.static ? BuildDateText(h) : BuildDate(h, {}),
              h.a
                .attr("href", "/rss.xml")
                .class(
                  css({
                    position: "relative",
                    zIndex: "10",
                    mt: "1",
                    width: "fit-content",
                    fontFamily: "mono",
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    color: "pink.700",
                    textTransform: "uppercase",
                    _hover: { color: "pink.950" },
                  }),
                )
                .children("RSS feed ↗"),
            ),
          ],
        }),
      ),
    );
