import type { Html } from "@effect/ui/html";
import type { Inline, InlineContent } from "@effect/ui/html/Markdown";
import { css } from "../../styled-system/css";
import { label } from "./box";

/**
 * Headings and the contents list of a post. The `.prose` rules themselves are
 * in `panda/prose.ts`; a heading opts out of them with `not-prose` and styles
 * itself here, as `src/components/prose.tsx` did.
 */

/** The plain text of inline nodes. */
export const textOf = (nodes: ReadonlyArray<Inline>): string =>
  nodes
    .map((node) => {
      switch (node._tag) {
        case "Text":
        case "InlineCode":
          return node.value;
        case "HardBreak":
          return "";
        case "Image":
          return node.alt;
        default:
          return textOf(node.content);
      }
    })
    .join("");

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const HEADING = {
  h2: {
    mt: "14",
    _first: { mt: "0" },
    mb: "4",
    fz: "2xl",
    md: { fz: "3xl" },
    textTransform: "uppercase",
    letterSpacing: "wide",
    fontWeight: "extrabold",
    _firstLetter: { color: "pink.500" },
  },
  h3: { mt: "10", mb: "3", fz: "xl", fontWeight: "bold" },
  h4: { mt: "8", mb: "2", fz: "lg", fontWeight: "bold" },
  h5: { mt: "6", mb: "2", fz: "base", fontWeight: "bold" },
  h6: {
    mt: "6",
    mb: "2",
    fz: "sm",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "wider",
  },
} as const;

type HeadingBlock = { _tag: string; level?: number; content?: ReadonlyArray<Inline> };

/**
 * The id of each top-level heading, in document order. A heading that repeats
 * an earlier one gets `-1`, `-2` and so on, so ids stay unique and the
 * contents list reaches each section.
 */
export const headingIds = (blocks: ReadonlyArray<HeadingBlock>): string[] => {
  const seen = new Map<string, number>();
  return blocks.flatMap((block) => {
    if (block._tag !== "Heading" || !block.content) return [];
    const base = slugify(textOf(block.content));
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return [count === 0 ? base : `${base}-${count}`];
  });
};

/** A heading with an id and a `#` link that shows on hover, so the contents list and shared links can point at it. */
export const proseHeading = <M>(
  h: Html.H<M>,
  level: 1 | 2 | 3 | 4 | 5 | 6,
  content: ReadonlyArray<Inline>,
  rendered: InlineContent<M>,
  id: string = slugify(textOf(content)),
) => {
  const tag = h[`h${level}`] as typeof h.h2;
  const style = HEADING[level === 1 ? "h2" : (`h${level}` as keyof typeof HEADING)];
  return tag
    .attr("id", id)
    .class(
      "not-prose",
      "group",
      css(
        {
          scrollMarginTop: "6",
          fontFamily: "display",
          lineHeight: "tight",
          color: "pink.950",
        },
        style,
      ),
    )
    .children(
      h.a
        .attr("href", `#${id}`)
        .class(css({ textDecoration: "none" }))
        .children(
          rendered,
          h.span
            .attr("aria-hidden", "true")
            .class(
              css({
                ml: "2",
                fontFamily: "mono",
                fz: "sm",
                color: "pink.300",
                opacity: "0",
                transition: "opacity 200ms",
                _groupHover: { opacity: "1" },
              }),
            )
            .children("#"),
        ),
    );
};

export type ContentsEntry = { id: string; text: string; depth: 2 | 3 };

/** The h2 and h3 headings of an encoded document, for the contents list. */
export const contentsOf = (blocks: ReadonlyArray<HeadingBlock>): ContentsEntry[] => {
  const ids = headingIds(blocks);
  let next = 0;
  return blocks.flatMap((block) => {
    if (block._tag !== "Heading" || !block.content) return [];
    const id = ids[next++]!;
    return block.level === 2 || block.level === 3
      ? [{ id, text: textOf(block.content), depth: block.level }]
      : [];
  });
};

/** "On this page". Unlike the old one it is built from the document, so it is in the prerendered HTML. */
export const Contents = <M>(h: Html.H<M>, entries: ReadonlyArray<ContentsEntry>) =>
  entries.length === 0
    ? null
    : h.nav
        .attr("aria-label", "On this page")
        .class(css({ position: "sticky", top: "6" }))
        .children(
          h.p.class(css(label, { mb: "3" })).children("On this page"),
          h.ol
            .class(
              css({
                display: "flex",
                flexDirection: "column",
                gap: "1.5",
                borderLeftWidth: "1px",
                borderColor: "pink.200",
              }),
            )
            .children(
              entries.map((entry) =>
                h.li.key(entry.id).children(
                  h.a
                    .attr("href", `#${entry.id}`)
                    .class(
                      css({
                        ml: "-1px",
                        display: "block",
                        borderLeftWidth: "2px",
                        borderColor: "transparent",
                        py: "0.5",
                        fontSize: "13px",
                        lineHeight: "snug",
                        color: "pink.950/60",
                        transition: "color 200ms",
                        _hover: { color: "pink.950" },
                        pl: entry.depth === 3 ? "6" : "3",
                      }),
                    )
                    .children(entry.text),
                ),
              ),
            ),
        );
