/**
 * The `.prose` typography of post and project bodies, as a Panda `globalCss`
 * fragment. Merge it into `globalCss` in `panda.config.ts`, next to
 * `highlightStyles` from `./highlight`.
 *
 * It is the old `prose prose-pink` (Tailwind typography's base size, 1rem) with
 * the site's overrides from `src/styles.css` folded in, so each selector holds
 * the final result. Every rule keeps the typography plugin's
 * `:not(:where(.not-prose, .not-prose *))` guard, which the headings in
 * `app/ui/prose.ts` use to opt out and style themselves.
 *
 * Panda reads this file statically, so it is plain data with no helpers
 * imported from `styled-system`.
 */

const gray = {
  counters: "oklch(55.1% 0.027 264.364)",
  bullets: "oklch(87.2% 0.01 258.338)",
  hr: "oklch(92.8% 0.006 264.531)",
  heading: "oklch(21% 0.034 264.665)",
  thBorder: "oklch(87.2% 0.01 258.338)",
  tdBorder: "oklch(92.8% 0.006 264.531)",
} as const;

const guard = ':not(:where([class~="not-prose"], [class~="not-prose"] *))';
/** A `>` selector is relative to `.prose` itself, so it goes inside the `:where`. */
const where = (selector: string) =>
  selector.startsWith(">")
    ? `:where(${selector
        .split(", ")
        .map((part) => `.prose ${part}`)
        .join(", ")})${guard}`
    : `.prose :where(${selector})${guard}`;

type Rules = Record<string, Record<string, unknown>>;

/** Merges rules written for the same selector, the later one winning. */
const merge = (...groups: Rules[]): Rules => {
  const out: Rules = {};
  for (const group of groups) {
    for (const [selector, style] of Object.entries(group)) {
      out[selector] = { ...out[selector], ...style };
    }
  }
  return out;
};

const rules = (entries: [selector: string, style: Record<string, unknown>][]): Rules =>
  merge(...entries.map(([selector, style]) => ({ [where(selector)]: style })));

/** Tailwind typography's DEFAULT and base modifier, with the `gray` palette. */
const typography = rules([
  ["p", { marginTop: "1.25em", marginBottom: "1.25em" }],
  ["a", { color: "pink.600", textDecoration: "underline", fontWeight: "500" }],
  ["strong", { color: gray.heading, fontWeight: "600" }],
  ["a strong, blockquote strong, thead th strong", { color: "inherit" }],
  ["ol", { listStyleType: "decimal", marginTop: "1.25em", marginBottom: "1.25em" }],
  ["ul", { listStyleType: "disc", marginTop: "1.25em", marginBottom: "1.25em" }],
  ["ol, ul", { paddingInlineStart: "1.625em" }],
  ["ol > li::marker", { fontWeight: "400", color: gray.counters }],
  ["ul > li::marker", { color: gray.bullets }],
  ["li", { marginTop: "0.5em", marginBottom: "0.5em" }],
  ["ol > li, ul > li", { paddingInlineStart: "0.375em" }],
  ["> ul > li p", { marginTop: "0.75em", marginBottom: "0.75em" }],
  ["> ul > li > p:first-child, > ol > li > p:first-child", { marginTop: "1.25em" }],
  ["> ul > li > p:last-child, > ol > li > p:last-child", { marginBottom: "1.25em" }],
  ["ul ul, ul ol, ol ul, ol ol", { marginTop: "0.75em", marginBottom: "0.75em" }],
  ["hr", { borderColor: gray.hr, borderTopWidth: "1px", marginTop: "3em", marginBottom: "3em" }],
  ["hr + *, h2 + *, h3 + *, h4 + *", { marginTop: "0" }],
  [
    "blockquote",
    {
      fontWeight: "500",
      fontStyle: "italic",
      color: gray.heading,
      borderInlineStartWidth: "0.25rem",
      borderInlineStartColor: gray.hr,
      quotes: '"\\201C""\\201D""\\2018""\\2019"',
      marginTop: "1.6em",
      marginBottom: "1.6em",
      paddingInlineStart: "1em",
    },
  ],
  ["blockquote p:first-of-type::before", { content: "open-quote" }],
  ["blockquote p:last-of-type::after", { content: "close-quote" }],
  ["h1", { color: gray.heading, fontWeight: "800", fontSize: "2.25em", lineHeight: "1.1111" }],
  ["h1", { marginTop: "0", marginBottom: "0.8889em" }],
  ["h2", { fontSize: "1.5em", marginTop: "2em", marginBottom: "1em", lineHeight: "1.3333" }],
  ["h3", { fontSize: "1.25em", marginTop: "1.6em", marginBottom: "0.6em", lineHeight: "1.6" }],
  ["h4", { marginTop: "1.5em", marginBottom: "0.5em", lineHeight: "1.5" }],
  ["h1 strong, h2 strong, h3 strong, h4 strong", { color: "inherit" }],
  ["img, picture, video, figure", { marginTop: "2em", marginBottom: "2em" }],
  ["picture", { display: "block" }],
  ["picture > img, figure > *", { marginTop: "0", marginBottom: "0" }],
  [
    "kbd",
    {
      fontWeight: "500",
      fontFamily: "inherit",
      color: gray.heading,
      boxShadow: "0 0 0 1px rgb(17 24 39 / 0.1), 0 3px 0 rgb(17 24 39 / 0.1)",
      fontSize: "0.875em",
      borderRadius: "0.3125rem",
      padding: "0.1875em 0.375em",
    },
  ],
  ["code", { color: gray.heading, fontWeight: "600", fontSize: "0.875em" }],
  ["code::before, code::after", { content: '"`"' }],
  [
    "a code, h1 code, h2 code, h3 code, h4 code, blockquote code, thead th code",
    { color: "inherit" },
  ],
  ["h2 code", { fontSize: "0.875em" }],
  ["h3 code", { fontSize: "0.9em" }],
  [
    "pre",
    {
      color: "oklch(92.8% 0.006 264.531)",
      backgroundColor: "oklch(27.8% 0.033 256.848)",
      overflowX: "auto",
      fontWeight: "400",
      fontSize: "0.875em",
      lineHeight: "1.7143",
      marginTop: "1.7143em",
      marginBottom: "1.7143em",
      borderRadius: "0.375rem",
      padding: "0.8571em 1.1429em",
    },
  ],
  [
    "pre code",
    {
      backgroundColor: "transparent",
      borderWidth: "0",
      borderRadius: "0",
      padding: "0",
      fontWeight: "inherit",
      color: "inherit",
      fontSize: "inherit",
      fontFamily: "inherit",
      lineHeight: "inherit",
    },
  ],
  ["pre code::before, pre code::after", { content: "none" }],
  [
    "table",
    {
      width: "100%",
      tableLayout: "auto",
      marginTop: "2em",
      marginBottom: "2em",
      fontSize: "0.875em",
      lineHeight: "1.7143",
    },
  ],
  ["thead", { borderBottomWidth: "1px", borderBottomColor: gray.thBorder }],
  [
    "thead th",
    {
      color: gray.heading,
      fontWeight: "600",
      verticalAlign: "bottom",
      paddingInlineEnd: "0.5714em",
      paddingBottom: "0.5714em",
      paddingInlineStart: "0.5714em",
    },
  ],
  ["thead th:first-child", { paddingInlineStart: "0" }],
  ["thead th:last-child", { paddingInlineEnd: "0" }],
  ["tbody tr", { borderBottomWidth: "1px", borderBottomColor: gray.tdBorder }],
  ["tbody tr:last-child", { borderBottomWidth: "0" }],
  ["tbody td", { verticalAlign: "baseline", padding: "0.5714em" }],
  ["tbody td:first-child", { paddingInlineStart: "0" }],
  ["tbody td:last-child", { paddingInlineEnd: "0" }],
  ["th, td", { textAlign: "start" }],
  [
    "figcaption",
    {
      color: "oklch(55.1% 0.027 264.364)",
      fontSize: "0.875em",
      lineHeight: "1.4286",
      marginTop: "0.8571em",
    },
  ],
]);

/** The site's overrides from `src/styles.css`, over the typography above. */
const site = rules([
  ["p", { textAlign: "justify", marginTop: "0", marginBottom: "1.5rem" }],
  [
    "a",
    {
      color: "pink.400",
      textDecoration: "none",
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderColor: "pink.400",
    },
  ],
  ["strong", { color: "pink.600" }],
  ["code", { color: "pink.500", fontWeight: "400" }],
  ["pre code", { color: "#575279" }],
  [
    "pre",
    {
      borderWidth: "1px",
      borderColor: "var(--border)",
      backgroundColor: "white !important",
      borderRadius: "0",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
    },
  ],
  ...(["h1", "h2", "h3", "h4", "h5"] as const).map((tag): [string, Record<string, unknown>] => [
    tag,
    {
      color: "pink.800",
      marginTop: "0.5rem",
      marginBottom: "0.5rem",
      // `leading-normal` sets the variable that Tailwind's `text-*` line height
      // reads, so every level has a 1.5 line height.
      lineHeight: "1.5",
      fontFamily: "heading",
      fontWeight: "600",
    },
  ]),
  ["h1", { fontSize: "1.875rem" }],
  ["h2", { fontSize: "1.5rem" }],
  ["h3", { fontSize: "1.25rem" }],
  ["h4", { fontSize: "1.125rem" }],
  ["h5", { fontSize: "1rem" }],
  ["li p:first-child", { marginBottom: "0.5rem" }],
]);

/** Tailwind's `.prose pre.th-code` block, written without `:where` so it outranks the rules above. */
const highlighted: Rules = {
  [`.prose pre.th-code${guard}`]: {
    marginTop: "1.5rem",
    marginBottom: "1.5rem",
    backgroundColor: "#faf4ed !important",
    borderWidth: "1px",
    borderStyle: "dashed",
    borderColor: "#f2e9e1",
    borderRadius: "0",
    padding: "1rem",
    fontFamily: "mono",
    fontSize: "0.875rem",
    lineHeight: "1.625",
    overflowX: "auto",
  },
  [`.prose pre.th-code code${guard}`]: {
    backgroundColor: "transparent !important",
    color: "#575279 !important",
    padding: "0",
  },
};

export const proseStyles = {
  ".prose": {
    color: "color-mix(in oklab, var(--colors-pink-950) 80%, transparent)",
    fontSize: "1rem",
    lineHeight: "1.75",
    maxWidth: "65ch",
  },
  ".prose > :first-child": { marginTop: "0" },
  ".prose > :last-child": { marginBottom: "0" },
  ...merge(typography, site, highlighted),
} as const;
