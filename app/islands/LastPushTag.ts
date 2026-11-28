import { Schema } from "effect";
import { Island } from "../island";
import { sharedApi } from "../island/api";

export const LastPushTag = Island.define({
  component: () => import("../ui/based-row").then((m) => m.LastPushTag),
  props: Schema.Struct({}),
  layers: [sharedApi],
  fallback: (h) => h.span,
});
