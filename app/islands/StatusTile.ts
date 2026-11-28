import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { StatusBoard, StatusBoardData, StatusTile } from "../ui/based-row";

export const api = true;

/**
 * A root for the home page's status tile. The tile is a provided component
 * (its Layer is browser-only), so it sits under a root that has no Layer of
 * its own and keeps the `fallback` the prerender drew until the Layer is up.
 */
export const island = Html.component({
  name: "StatusTileIsland",
  props: Schema.Struct({ board: StatusBoardData }),
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  view: (h) =>
    StatusTile(h, {
      key: "status",
      props: { board: h.props.board },
      fallback: () => StatusBoard(h, { activity: null, now: null, board: h.props.board }),
    }),
});
