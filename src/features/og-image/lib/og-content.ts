import sites from "~/data/sites";
import type { OgImageSpec } from "./og-image";

const domainName = new URL(sites.siteUrl).hostname;

export interface OgContent {
  /** Short label above the title, e.g. `POST`. */
  kind: string;
  /** The date as the site writes it: `20 February 2026`. */
  date: string;
  title: string;
  description: string;
  tags: string[];
  domain: string;
}

export function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/**
 * `en-GB` without the weekday, matching how the blog list and the work
 * experience rows print dates. The card has room for the date but not for the
 * extra four words the weekday cost.
 */
export function formatDate(date: string) {
  // oxlint-disable-next-line efx-no-native-date
  const parsed = new Date(date);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

/**
 * Title length backstop. `ogImageSpecSchema` already rejects titles over 120
 * characters, so in practice the sizing below handles the title and this never
 * fires; it stays for callers that build a spec without going through the
 * schema.
 */
const TITLE_BUDGET = 120;

/** The description gets two or three lines. */
const DESCRIPTION_BUDGET = 120;

/** The tag row has to fit the same width the title does. */
const TAG_BUDGET = 4;

/**
 * How the title steps down as it gets longer. The `min` value is low enough
 * that even a 120-character title fits its frame, which is what lets the whole
 * title survive instead of being cut.
 */
const TITLE_FIT = { max: 68, min: 30, free: 26, step: 1.05 } as const;

/**
 * Shrink the title instead of truncating it.
 *
 * A card has a fixed frame, so a long title has to give something up. Cutting
 * words off loses the part of the title that makes someone click; a smaller
 * size keeps all of it. `free` is the length that still gets the full size.
 */
export function fitTitleSize(title: string): number {
  const { max, min, free, step } = TITLE_FIT;
  return Math.round(Math.max(min, max - Math.max(0, title.length - free) * step));
}

export function toOgContent(spec: OgImageSpec): OgContent {
  if (spec.type === "post") {
    return {
      kind: "post",
      date: formatDate(spec.date),
      title: truncate(spec.title, TITLE_BUDGET),
      description: truncate(spec.description, DESCRIPTION_BUDGET),
      tags: spec.tags.slice(0, TAG_BUDGET).map((tag) => truncate(tag, 18)),
      domain: domainName,
    };
  }
  return {
    kind: "page",
    date: "",
    title: truncate(spec.title, TITLE_BUDGET),
    description: spec.subtitle ? truncate(spec.subtitle, DESCRIPTION_BUDGET) : "",
    tags: [],
    domain: domainName,
  };
}
