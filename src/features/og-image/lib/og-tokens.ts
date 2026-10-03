/**
 * Design tokens for the OG card, mirrored from `src/styles.css` and the
 * computed values of the live site.
 *
 * These are duplicated rather than imported because the card renders through
 * Takumi, which does not resolve CSS custom properties or Tailwind classes.
 * Each value below names the source it was taken from so the two do not drift
 * silently — re-check them when the site's palette changes.
 */

/** Tailwind `pink-50` — the post-list tag chip fill (`bg-pink-50`). */
export const CREAM = "#fdf2f8";

/**
 * Pink wash: `pink-50` → `pink-100`, the same 135deg shape as the `body`
 * background but two pink steps deeper so the card reads pink even at
 * thumbnail size. Stops before `pink-200` so the `pink-200` frame keeps an
 * edge against it. Dark `pink-950` type keeps full contrast on top.
 */
export const PAGE_GRADIENT = "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)";

/** Tailwind `pink-*` steps the frame, heading marks, and rules are built from. */
export const PINK_200 = "#fccee8";
/** `after:bg-pink-300` — the brighter segment on the heading underline. */
export const PINK_300 = "#fda5d5";
/** `text-pink-400` — the eyebrow and the domain line (`text-pink-400`). */
export const PINK_400 = "#f472b6";
/** `text-pink-700` — the post-list tag text (`text-pink-700`). */
export const PINK_700 = "#be185d";

/** The `Frame` corner tabs: `bg-yellow-300` over `bg-sky-200`. */
export const SKY_200 = "#b8e6fe";
export const YELLOW_300 = "#ffdf20";

/** `#text-pink-950` — the title color, after oklch → sRGB. */
export const HEADING_INK = "#510728";

/** Brand fonts, pinned per `ogFonts()` in `og-image.tsx`. */
export const DISPLAY_FONT = "'Google Sans',sans-serif";
export const MONO_FONT = "'IBM Plex Mono',monospace";
