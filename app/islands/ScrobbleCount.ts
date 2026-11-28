import { Schema } from "effect";
import { Island } from "../island";
import { sharedApi } from "../island/api";
import { countStyle } from "../ui/music-body";

export const ScrobbleCount = Island.define({
  component: () => import("../ui/music-body").then((m) => m.ScrobbleCount),
  props: Schema.Struct({}),
  layers: [sharedApi],
  fallback: (h) => h.p.class(countStyle).children("…"),
});
