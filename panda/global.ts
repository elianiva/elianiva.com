/**
 * Page-level CSS: the reset on top of Panda's preflight, the theme variables,
 * and the decorative rules that components apply as plain class names
 * (cell patterns, floating shapes, entrance motion, the hero's hop).
 * Ported from the Tailwind `styles.css`.
 */
const ease = "cubic-bezier(0.23, 1, 0.32, 1)";

export const globalVars = {
  "--pat-shift": { syntax: "<length>", inherits: true, initialValue: "0px" },
} as const;

export const globalCss = {
  ":root": {
    "--background": "oklch(1 0 0)",
    "--foreground": "oklch(28.4% 0.109 3.907)",
    "--card": "oklch(1 0 0)",
    "--card-foreground": "oklch(0.145 0.008 326)",
    "--popover": "oklch(1 0 0)",
    "--popover-foreground": "oklch(0.145 0.008 326)",
    "--primary": "oklch(0.525 0.223 3.958)",
    "--primary-foreground": "oklch(0.971 0.014 343.198)",
    "--secondary": "oklch(89.9% 0.061 343.231)",
    "--secondary-foreground": "oklch(0.21 0.006 285.885)",
    "--muted": "oklch(1 0 0 / 0.6)",
    "--muted-foreground": "oklch(0.542 0.034 322.5)",
    "--accent": "oklch(0.96 0.003 325.6)",
    "--accent-foreground": "oklch(0.212 0.019 322.12)",
    "--destructive": "oklch(0.577 0.245 27.325)",
    "--border": "oklch(0.899 0.061 343.231 / 0.5)",
    "--input": "oklch(0.922 0.005 325.62)",
    "--ring": "oklch(0.711 0.019 323.02)",
    "--radius": "0.625rem",
    "--container": "960px",
    "--ease-out-strong": ease,
    "--ease-in-out-strong": "cubic-bezier(0.77, 0, 0.175, 1)",
  },
  "*": {
    borderColor: "var(--border)",
    outlineColor: "color-mix(in oklab, var(--ring) 50%, transparent)",
    transitionTimingFunction: "var(--ease-out-strong)",
    transitionDuration: "200ms",
  },
  html: {
    scrollbarGutter: "stable",
    // 17px root: every rem-based size scales up a notch.
    fontSize: "106.25%",
    fontFamily: '"Google Sans Variable", sans-serif',
  },
  body: {
    overscrollBehavior: "none",
    overflowX: "hidden",
    background: "linear-gradient(135deg, #fff5f0 0%, #fff9f5 50%, #fff0f5 100%) no-repeat fixed",
    position: "relative",
    color: "#431407",
    lineHeight: "1.75",
    letterSpacing: "-0.005em",
    fontOpticalSizing: "auto",
    textRendering: "optimizeLegibility",
    WebkitFontSmoothing: "antialiased",
  },
  "h1, h2, h3": { letterSpacing: "-0.02em", lineHeight: "1.2" },
  "body::before": {
    content: '""',
    position: "fixed",
    inset: "0",
    opacity: "0.03",
    pointerEvents: "none",
    zIndex: "-1",
    backgroundImage: 'url("/assets/noise.webp")',
    backgroundSize: "64px 64px",
  },
  "body::after": {
    content: '""',
    position: "fixed",
    inset: "0",
    background:
      "radial-gradient(ellipse at center, transparent 50%, rgba(255, 245, 240, 0.5) 100%)",
    pointerEvents: "none",
    zIndex: "-1",
  },
  "*:focus-visible": { outline: "3px solid #db2777", outlineOffset: "3px" },
  "a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible, [tabindex]:focus-visible":
    {
      outline: "3px solid #db2777",
      outlineOffset: "3px",
      boxShadow: "0 0 0 4px rgba(219, 39, 119, 0.15)",
    },
  "@media (prefers-reduced-motion: reduce)": {
    "*:focus-visible": { transition: "none" },
    ".cells-enter > *": { animationName: "fade-in, none" },
    "*, ::before, ::after": {
      transitionProperty:
        "color, background-color, border-color, outline-color, opacity !important",
    },
    ".delight-letter, .delight-line, .delight-spark": { animation: "none" },
  },

  ".with-box-underline::after": {
    content: '""',
    position: "absolute",
    bottom: "0",
    width: "100dvw",
    left: "50%",
    transform: "translateX(-50%)",
    background: "color-mix(in oklab, var(--colors-pink-200) 50%, transparent)",
    height: "1px",
  },
  ".with-box-upperline::before": {
    content: '""',
    position: "absolute",
    top: "0",
    width: "100dvw",
    left: "50%",
    transform: "translateX(-50%)",
    background: "color-mix(in oklab, var(--colors-pink-200) 50%, transparent)",
    height: "1px",
  },

  // Cell patterns: each draws in --pat-ink over the cell's own background as
  // one tile of --pat-tile pixels; shifting --pat-shift by a tile moves it
  // without a seam.
  ".pat-dither": {
    "--pat-tile": "8px",
    "--pat-dur": "1.6s",
    backgroundImage:
      "radial-gradient(var(--pat-ink) 0.75px, transparent 1px), radial-gradient(var(--pat-ink) 0.75px, transparent 1px)",
    backgroundSize: "8px 8px",
    backgroundPosition:
      "var(--pat-shift) var(--pat-shift), calc(var(--pat-shift) + 4px) calc(var(--pat-shift) + 4px)",
  },
  ".pat-lines": {
    "--pat-tile": "10px",
    "--pat-dur": "2s",
    backgroundImage: "linear-gradient(var(--pat-ink) 1px, transparent 1px)",
    backgroundSize: "100% 10px",
    backgroundPosition: "0 var(--pat-shift)",
  },
  ".pat-diag": {
    "--pat-tile": "14px",
    "--pat-dur": "2.8s",
    backgroundImage:
      "repeating-linear-gradient(135deg, var(--pat-ink) 0 1px, transparent 1px 9.8995px)",
    backgroundSize: "14px 14px",
    backgroundPosition: "var(--pat-shift) 0",
  },
  ".pat-graph": {
    "--pat-tile": "20px",
    "--pat-dur": "4s",
    backgroundImage:
      "linear-gradient(var(--pat-ink) 1px, transparent 1px), linear-gradient(90deg, var(--pat-ink) 1px, transparent 1px)",
    backgroundSize: "20px 20px",
    backgroundPosition: "var(--pat-shift) var(--pat-shift)",
  },
  ".pat-fade": { "--pat-tile": "6px", "--pat-dur": "1.2s", isolation: "isolate" },
  ".pat-fade::before": {
    content: '""',
    position: "absolute",
    inset: "0",
    zIndex: "-1",
    pointerEvents: "none",
    backgroundImage: "radial-gradient(var(--pat-ink) 0.9px, transparent 1.2px)",
    backgroundSize: "6px 6px",
    backgroundPosition: "0 calc(var(--pat-shift) * -1)",
    maskImage: "linear-gradient(to top, #000, transparent 65%)",
  },
  "@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)": {
    ".pat-live:hover": { animationPlayState: "running" },
  },

  // Floating background shapes. Only transform and opacity animate.
  // Cells set their own `display`, which would beat the attribute's UA rule.
  "[hidden]": { display: "none !important" },
  // The nav strip opens on the current page's ticket (static pages; `app/static.ts` covers browsers without this).
  "[data-center-current] > li:has([aria-current=page])": { scrollInitialTarget: "nearest" },
  ".floating-shapes": {
    position: "fixed",
    inset: "0",
    zIndex: "-10",
    overflow: "hidden",
    pointerEvents: "none",
    containerType: "size",
    "--ar": "1.6",
    background:
      "linear-gradient(to top right, rgb(255, 245, 240), rgb(255, 249, 245) 50%, rgb(255, 240, 245))",
  },
  ".fs-pos": {
    position: "absolute",
    top: "0",
    left: "0",
    width: "0",
    height: "0",
    animation:
      "fs-x var(--x-dur) linear var(--x-delay) infinite var(--x-dir), fs-y var(--y-dur) linear var(--y-delay) infinite var(--y-dir)",
  },
  ".fs-svg": {
    position: "absolute",
    width: "calc(var(--side) * 1cqh)",
    height: "calc(var(--side) * 1cqh)",
    left: "calc(var(--side) * -0.5cqh)",
    top: "calc(var(--side) * -0.5cqh)",
    transform: "scaleX(var(--ar))",
    animation:
      "fs-spin var(--spin-dur) linear infinite var(--spin-dir), fs-breathe var(--breathe-dur) ease-in-out var(--breathe-delay) infinite alternate",
  },
  ".floating-shapes[data-paused] .fs-pos, .floating-shapes[data-paused] .fs-svg": {
    animationPlayState: "paused",
  },

  // Cells rise into place when a page opens, one after another.
  ".cells-enter > *": {
    animation: `cell-in 300ms ${ease} backwards, pat-drift var(--pat-dur, 2s) linear infinite paused`,
  },
  ".cells-enter > :nth-child(2)": { animationDelay: "30ms" },
  ".cells-enter > :nth-child(3)": { animationDelay: "60ms" },
  ".cells-enter > :nth-child(4)": { animationDelay: "85ms" },
  ".cells-enter > :nth-child(5)": { animationDelay: "110ms" },
  ".cells-enter > :nth-child(6)": { animationDelay: "130ms" },
  ".cells-enter > :nth-child(7)": { animationDelay: "150ms" },
  ".cells-enter > :nth-child(8)": { animationDelay: "165ms" },
  ".cells-enter > :nth-child(9)": { animationDelay: "180ms" },
  ".cells-enter > :nth-child(n + 10)": { animationDelay: "195ms" },

  // The hero's "delightful": a wave of hops, a squiggle that draws itself, sparkles.
  ".delight-letter": {
    display: "inline-block",
    animation: `delight-hop 360ms ${ease} var(--d) both`,
  },
  ".delight-line": { strokeDasharray: "1", animation: `delight-draw 420ms ${ease} 150ms both` },
  ".delight-spark": { opacity: "0", animation: `delight-spark 520ms ${ease} var(--d) both` },
  ".animate-shake": { animation: "shake 0.5s linear" },
} as const;

export const keyframes = {
  shake: {
    "0%, 100%": { transform: "translateX(0)" },
    "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
    "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
  },
  "pat-drift": { to: { "--pat-shift": "var(--pat-tile)" } },
  "fs-x": {
    from: { translate: "calc(var(--m) * -1cqw) 0" },
    to: { translate: "calc(100cqw + var(--m) * 1cqw) 0" },
  },
  "fs-y": {
    from: { transform: "translateY(calc(var(--m) * -1cqh))" },
    to: { transform: "translateY(calc(100cqh + var(--m) * 1cqh))" },
  },
  "fs-spin": { to: { rotate: "360deg" } },
  "fs-breathe": { from: { opacity: "0" }, to: { opacity: "calc(var(--alpha) * 0.5)" } },
  "cell-in": { from: { transform: "translateY(10px)" } },
  "fade-in": { from: { opacity: "0" } },
  "delight-hop": {
    "35%": { transform: "translateY(-0.14em) rotate(var(--tilt))" },
    "70%": { transform: "translateY(0.02em)" },
  },
  "delight-draw": { from: { strokeDashoffset: "1" } },
  "delight-spark": {
    "0%": { opacity: "0", transform: "scale(0) rotate(0deg)" },
    "40%": { opacity: "1", transform: "scale(1) rotate(45deg)" },
    "100%": { opacity: "0", transform: "scale(0.4) rotate(90deg)" },
  },
  pulse: { "50%": { opacity: "0.5" } },
  spin: { to: { transform: "rotate(360deg)" } },
  ping: { "75%, 100%": { transform: "scale(2)", opacity: "0" } },
} as const;
