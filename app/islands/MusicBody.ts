import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Loading, MusicBody } from "../ui/music-body";

export const api = true;

/** A root for the music page's charts and sleeves; see `StatusTile.ts`. */
export const island = Html.component({
  name: "MusicBodyIsland",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  view: (h) => MusicBody(h, { key: "body", fallback: () => Loading(h) }),
});
