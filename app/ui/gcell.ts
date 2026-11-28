import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";
import { Cell, stretched, type Style } from "./box";

/** A cell other things in it react to when it is hovered. */
export const GCell: typeof Cell = (h, options) => Cell(h, options).class("group");

export const LabelLink = <M>(h: Html.H<M>, href: string, text: string) =>
  h.a.class(css(stretched)).attr("href", href).children(text);

export const trunc: Style = {
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
