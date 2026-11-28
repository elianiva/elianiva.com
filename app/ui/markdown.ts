import type { Html } from "@effect/ui/html";
import { Markdown } from "@effect/ui/html";
import { css } from "../../styled-system/css";
import { Islands } from "../content/islands";
import { regexPresets } from "../content/regex-presets";
import { highlighter } from "../lib/highlight";
import { CodeCopy } from "./code-copy";
import { headingIds, proseHeading } from "./prose";
import { Island } from "../islands/island";
import { formatUtcDate } from "../lib/date";

const longDate = {
  format: (d: Date | string | number) =>
    formatUtcDate(d, { day: "numeric", month: "long", year: true }),
};

/**
 * A fence whose info string names a pattern set in `regexPresets`: each line
 * is cut into runs, and a run takes the colour of the first pattern that
 * matches where it starts.
 */
const RegexBlock = <M>(
  h: Html.H<M>,
  text: string,
  patterns: { pattern: string; color: string }[],
) => {
  const compiled = patterns.map((p) => ({ regex: new RegExp(p.pattern, "g"), color: p.color }));
  const lines = text.trim().split("\n");
  return h.div.class(css({ my: "6", overflowX: "auto" })).children(
    h.pre
      .class(
        css({ fontFamily: "mono", fz: "sm", lineHeight: "relaxed", my: "0 !important", py: "0" }),
      )
      .children(
        lines.map((line, lineIdx) => {
          const segments: { text: string; color: string | null }[] = [];
          let remaining = line;
          while (remaining.length > 0) {
            let hit: { end: number; color: string } | null = null;
            for (const { regex, color } of compiled) {
              regex.lastIndex = 0;
              const match = regex.exec(remaining);
              if (match && match.index === 0) {
                hit = { end: match[0].length, color };
                break;
              }
            }
            if (hit) {
              segments.push({ text: remaining.slice(0, hit.end), color: hit.color });
              remaining = remaining.slice(hit.end);
            } else {
              segments.push({ text: remaining.slice(0, 1), color: null });
              remaining = remaining.slice(1);
            }
          }
          return h.div.key(String(lineIdx)).children(
            segments.map((seg, i) =>
              seg.color
                ? h.span.key(String(i)).style({ color: seg.color }).children(seg.text)
                : h.span
                    .key(String(i))
                    .class(css({ color: "pink.950/80" }))
                    .children(seg.text),
            ),
          );
        }),
      ),
  );
};

/** A highlighted fence in `th-*` classes, with a copy button that shows on hover. */
const HighlightedBlock = <M>(h: Html.H<M>, language: string | undefined, value: string) => {
  const { tokens, lang } = highlighter.tokenize(value, { lang: language ?? "plaintext" });
  return h.div.class("group", css({ position: "relative" })).children(
    h.pre
      .class("th-code", `th-code--${lang}`)
      .attr("data-language", lang)
      .children(
        h.code.children(
          tokens.map((token, i) =>
            token.className
              ? h.span
                  .key(String(i))
                  .class("th-token", `th-${token.className}`)
                  .children(token.value)
              : token.value,
          ),
        ),
      ),
    CodeCopy(h),
  );
};

const note = {
  borderLeftWidth: "1px",
  p: "4",
  my: "6",
  "& > :last-child": { mb: "0" },
} as const;

/**
 * Renders one compiled Markdown document (the default export of a
 * `postBodies` or `projectBodies` loader) with the site's prose styling,
 * syntax highlighting and islands. Put the result in an element with the
 * `prose` class: the typography is in `panda/prose.ts`.
 */
export const renderMarkdown = <M>(h: Html.H<M>, encoded: unknown) => {
  const document = Markdown.decodeDocument(encoded);
  const ids = headingIds(document.blocks as never);
  const idOf = new WeakMap<object, string>();
  document.blocks
    .filter((block) => block._tag === "Heading")
    .forEach((block, index) => idOf.set((block as { content: object }).content, ids[index]!));
  return Markdown.view(h, document, {
    views: {
      Heading: (h, { level, content }, rendered) =>
        proseHeading(h, level, content, rendered, idOf.get(content)),
      CodeBlock: (h, { language, value }) => {
        const name = language._tag === "Some" ? language.value : undefined;
        const preset = name === undefined ? undefined : regexPresets[name];
        return preset
          ? RegexBlock(h, value, preset)
          : HighlightedBlock(h, name, value.replace(/\n$/, ""));
      },
    },
    islands: Markdown.islandsFor(Islands, {
      Update: (h, { date }, content) =>
        h.div.class(css(note, { borderColor: "pink.400", bg: "pink.50/60" })).children(
          h.p
            .class(
              css({
                fz: "xs",
                fontFamily: "mono",
                color: "pink.600",
                textTransform: "uppercase",
                letterSpacing: "wider",
                mb: "2 !important",
                textAlign: "left !important",
              }),
            )
            .children(`Updated on ${longDate.format(new Date(date))}`),
          h.div.class(css({ color: "pink.950/80" })).children(content),
        ),
      Term: (h, { name }, content) =>
        h.div
          .attr("id", `term-${name}`)
          .class(
            css(note, {
              my: "3",
              p: "3",
              borderColor: "pink.300",
              bg: "pink.50/40",
              scrollMarginTop: "6",
              _target: { bg: "pink.100" },
            }),
          )
          .children(
            h.p
              .class(
                css({
                  fontWeight: "medium",
                  color: "pink.700",
                  mb: "1 !important",
                  textAlign: "left !important",
                }),
              )
              .children(name),
            h.div.class(css({ fz: "sm", "& p": { mb: "0" } })).children(content),
          ),
      Greentext: (h, _attributes, content) =>
        h.div
          .class(
            css(note, {
              borderColor: "pink.300",
              bg: "pink.50/40",
              fontFamily: "mono",
              fz: "sm",
              "& ul": { listStyleType: "none", pl: "0", my: "0" },
              "& li": { color: "green.700", pl: "0", my: "0", mb: "1", _last: { mb: "0" } },
              "& li::before": { content: '">"' },
              "& li p": { m: "0", textAlign: "left" },
            }),
          )
          .children(content),
      Quiz: (h, { id }, _content, occurrence) =>
        Island(h, { name: "Quiz", id: `quiz-${occurrence}`, load: "visible", props: { id } }),
    }),
  });
};
