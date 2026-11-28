import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { ListeningCell, ListeningEmpty } from "../ui/home-grid";

/** A root for the home page's last-plays cell; see `StatusTile.ts`. */
export const island = Html.component({
  name: "ListeningCellIsland",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  view: (h) =>
    ListeningCell(h, { key: "listening", fallback: () => ListeningEmpty(h, undefined, false) }),
});
