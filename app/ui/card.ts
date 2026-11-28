import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";

/** shadcn's card pieces: each returns a builder to add children to. */
export const Card = <M>(h: Html.H<M>) =>
  h.div.class(
    css({
      display: "flex",
      flexDirection: "column",
      gap: "4",
      overflow: "hidden",
      rounded: "none",
      bg: "var(--card)",
      py: "0",
      fz: "xs",
      color: "var(--card-foreground)",
      boxShadow: "0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent)",
      transition: "colors 150ms",
    }),
  );

export const CardHeader = <M>(h: Html.H<M>) =>
  h.div.class(
    css({ display: "grid", gridAutoRows: "min-content", alignItems: "start", gap: "1", px: "4" }),
  );

export const CardTitle = <M>(h: Html.H<M>) =>
  h.div.class(css({ fontFamily: "heading", fz: "sm", fontWeight: "medium" }));

export const CardDescription = <M>(h: Html.H<M>) =>
  h.div.class(css({ fz: "xs", color: "muted-foreground" }));

export const CardContent = <M>(h: Html.H<M>) => h.div.class(css({ px: "4" }));

export const CardFooter = <M>(h: Html.H<M>) =>
  h.div.class(
    css({ display: "flex", alignItems: "center", rounded: "none", borderTopWidth: "1px", p: "4" }),
  );
