import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { countStyle, ScrobbleCount } from "../ui/music-body";

export const api = true;

/** A root for the scrobble count on the music page; see `StatusTile.ts`. */
export const island = Html.component({
  name: "ScrobbleCountIsland",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  view: (h) =>
    ScrobbleCount(h, { key: "count", fallback: () => h.p.class(countStyle).children("…") }),
});
