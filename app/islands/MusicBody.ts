import { Schema } from "effect";
import { Island } from "../island";
import { sharedApi } from "../island/api";
import { Loading } from "../ui/music-body";

export const MusicBody = Island.define({
  component: () => import("../ui/music-body").then((m) => m.MusicBody),
  props: Schema.Struct({}),
  layers: [sharedApi],
  fallback: (h) => Loading(h),
});
