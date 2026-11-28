import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { StatusBoard, StatusTile } from "../ui/based-row";

/**
 * A root for the home page's status tile. The tile is a provided component
 * (its Layer is browser-only), so it sits under a root that has no Layer of
 * its own and keeps the `fallback` the prerender drew until the Layer is up.
 */
export const island = Html.component({
  name: "StatusTileIsland",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  view: (h) =>
    StatusTile(h, { key: "status", fallback: () => StatusBoard(h, { activity: null, now: null }) }),
});
