import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";

/** A pulsing placeholder block; size it with `.class(...)` or `.style(...)`. */
export const Skeleton = <M>(h: Html.H<M>) =>
  h.div.class(
    css({
      animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      rounded: "none",
      bg: "muted",
    }),
  );
