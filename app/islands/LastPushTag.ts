export const api = true;

import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { LastPushTag } from "../ui/based-row";

/** A root for the `#pushed repo 14h ago` tag; see `StatusTile.ts`. */
export const island = Html.component({
  name: "LastPushTagIsland",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  view: (h) => LastPushTag(h, { key: "last-push", fallback: () => h.span }),
});
