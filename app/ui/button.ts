import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";

const base = css({
  position: "relative",
  display: "inline-flex",
  flexShrink: "0",
  alignItems: "center",
  justifyContent: "center",
  rounded: "none",
  border: "1px solid transparent",
  backgroundClip: "padding-box",
  fz: "xs",
  fontWeight: "medium",
  whiteSpace: "nowrap",
  outline: "none",
  userSelect: "none",
  cursor: "pointer",
  _active: { transform: "translateY(1px)" },
  _disabled: { pointerEvents: "none", opacity: "0.5" },
  _focusVisible: { borderColor: "ring", outline: "1px solid", outlineColor: "ring" },
  "& svg": { pointerEvents: "none", flexShrink: "0" },
});

const VARIANTS = {
  default: css({ bg: "primary", color: "primary-foreground" }),
  outline: css({ bg: "background", _hover: { bg: "muted", color: "foreground" } }),
  secondary: css({ bg: "secondary", color: "secondary-foreground" }),
  ghost: css({
    bg: "muted",
    _hover: { bg: "white", borderColor: "border", color: "foreground" },
  }),
  destructive: css({
    bg: "color-mix(in oklab, var(--destructive) 10%, transparent)",
    color: "destructive",
  }),
  link: css({
    color: "primary",
    textUnderlineOffset: "4px",
    _hover: { textDecoration: "underline" },
  }),
} as const;

const SIZES = {
  default: css({ height: "8", gap: "1.5", px: "2.5" }),
  xs: css({ height: "6", gap: "1", px: "2" }),
  sm: css({ height: "7", gap: "1", px: "2.5" }),
  lg: css({ height: "9", gap: "1.5", px: "2.5" }),
  icon: css({ width: "8", height: "8" }),
  "icon-xs": css({ width: "6", height: "6" }),
  "icon-sm": css({ width: "7", height: "7" }),
  "icon-lg": css({ width: "9", height: "9" }),
} as const;

/** A button (or, with `as: "a"`, a link styled as one). Add `.on`, `.attr` and `.children`. */
export const Button = <M>(
  h: Html.H<M>,
  options: {
    variant?: keyof typeof VARIANTS;
    size?: keyof typeof SIZES;
    as?: "button" | "a";
  } = {},
) => {
  const { variant = "default", size = "default", as = "button" } = options;
  const cls = [base, VARIANTS[variant], SIZES[size]].join(" ");
  return as === "a" ? h.a.class(cls) : h.button.class(cls).attr("type", "button");
};
