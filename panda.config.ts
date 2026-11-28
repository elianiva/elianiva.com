import { defineConfig } from "@pandacss/dev";
import { globalCss, globalVars, keyframes } from "./panda/global";
import { palette } from "./panda/palette";
import { highlightStyles } from "./panda/highlight";
import { proseStyles } from "./panda/prose";

/**
 * Tailwind's `text-*` sets size and line height together; Panda's `fontSize`
 * sets only the size. `fz` keeps the pair, so a ported `text-sm` is `fz: "sm"`.
 */
const TEXT = {
  xs: [".75rem", "1.3333"],
  sm: [".875rem", "1.4286"],
  base: ["1rem", "1.5"],
  lg: ["1.125rem", "1.5556"],
  xl: ["1.25rem", "1.4"],
  "2xl": ["1.5rem", "1.3333"],
  "3xl": ["1.875rem", "1.2"],
  "4xl": ["2.25rem", "1.1111"],
  "5xl": ["3rem", "1"],
  "6xl": ["3.75rem", "1"],
  "7xl": ["4.5rem", "1"],
} as const;

export default defineConfig({
  presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],
  preflight: true,
  include: ["./app/**/*.{ts,tsx}", "./panda/**/*.ts"],
  exclude: [],
  outdir: "styled-system",
  globalCss: { ...globalCss, ...highlightStyles, ...proseStyles },
  globalVars,
  // Hover motion only for a mouse or trackpad: a tap would leave it stuck on.
  conditions: {
    extend: {
      hover: { "@media (hover: hover) and (pointer: fine)": { "&:hover": "@slot" } },
    },
  },
  utilities: {
    extend: {
      fz: {
        className: "fz",
        values: Object.keys(TEXT),
        transform: (value: keyof typeof TEXT) => ({
          fontSize: TEXT[value][0],
          lineHeight: TEXT[value][1],
        }),
      },
    },
  },
  theme: {
    // Tailwind's breakpoints, with the site's wider `xl` and `2xl`.
    breakpoints: { sm: "40rem", md: "48rem", lg: "64rem", xl: "90rem", "2xl": "120rem" },
    extend: {
      keyframes,
      tokens: {
        colors: {
          ...palette,
          peach: { value: "#ffd4bc" },
          lavender: { value: "#e6e6fa" },
          cream: { value: "#fff9f5" },
          blush: { value: "#fff0f5" },
        },
        fonts: {
          sans: { value: '"Google Sans Variable", sans-serif' },
          display: { value: '"Google Sans Variable", sans-serif' },
          heading: { value: '"Google Sans Variable", sans-serif' },
          body: { value: '"Google Sans Variable", sans-serif' },
          mono: { value: '"IBM Plex Mono", monospace' },
        },
        easings: {
          "out-strong": { value: "cubic-bezier(0.23, 1, 0.32, 1)" },
          "in-out-strong": { value: "cubic-bezier(0.77, 0, 0.175, 1)" },
        },
      },
      semanticTokens: {
        colors: {
          background: { value: "var(--background)" },
          foreground: { value: "var(--foreground)" },
          border: { value: "var(--border)" },
          muted: { value: "var(--muted)" },
          "muted-foreground": { value: "var(--muted-foreground)" },
          primary: { value: "var(--primary)" },
          "primary-foreground": { value: "var(--primary-foreground)" },
          secondary: { value: "var(--secondary)" },
          "secondary-foreground": { value: "var(--secondary-foreground)" },
          destructive: { value: "var(--destructive)" },
          input: { value: "var(--input)" },
          ring: { value: "var(--ring)" },
        },
      },
    },
  },
});
