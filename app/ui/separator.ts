import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";

const HORIZONTAL = css({ flexShrink: "0", bg: "border", height: "1px", width: "100%" });
const VERTICAL = css({ flexShrink: "0", bg: "border", width: "1px", alignSelf: "stretch" });

export const Separator = <M>(h: Html.H<M>, orientation: "horizontal" | "vertical" = "horizontal") =>
  h.div.attr("role", "none").class(orientation === "vertical" ? VERTICAL : HORIZONTAL);
