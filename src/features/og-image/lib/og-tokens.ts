/**
 * Design tokens for the OG card, mirrored from `src/styles.css` and the
 * computed values of the live site.
 *
 * These are duplicated rather than imported because the card renders through
 * Takumi, which does not resolve CSS custom properties or Tailwind classes.
 * Each value below names the source it was taken from so the two do not drift
 * silently — re-check them when the site's palette changes.
 */

/** `--color-cream`, the tag chip fill. */
export const CREAM = "#fff9f5";

/** The `body` background, carried over so the card sits on the same page. */
export const PAGE_GRADIENT = "linear-gradient(135deg, #fff5f0 0%, #fff9f5 50%, #fff0f5 100%)";

/** Tailwind `pink-*` steps the frame, heading marks, and rules are built from. */
export const PINK_200 = "#fccee8";
/** `after:bg-pink-300` — the brighter segment on the heading underline. */
export const PINK_300 = "#fda5d5";
/** `text-pink-400` — the eyebrow and the domain line. */
export const PINK_400 = "#f472b6";

/** The `Frame` corner tabs: `bg-yellow-300` over `bg-sky-200`. */
export const SKY_200 = "#b8e6fe";
export const YELLOW_300 = "#ffdf20";

/** `#text-pink-950` — the Heading title color, after oklch → sRGB. */
export const HEADING_INK = "#510728";
/** `#text-pink-500` — the Heading first letter (`first-letter:text-pink-500`). */
export const HEADING_FIRST_LETTER = "#e94e9c";

/** Brand fonts, pinned per `ogFonts()` in `og-image.tsx`. */
export const DISPLAY_FONT = "'Google Sans',sans-serif";
export const MONO_FONT = "'IBM Plex Mono',monospace";
