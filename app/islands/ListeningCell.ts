import { Schema } from "effect";
import { Island } from "../island";
import { sharedApi } from "../island/api";
import { ListeningEmpty } from "../ui/listening-cell";

export const ListeningCell = Island.define({
  component: () => import("../ui/listening-cell").then((m) => m.ListeningCell),
  props: Schema.Struct({}),
  layers: [sharedApi],
  fallback: (h) => ListeningEmpty(h, undefined, false),
});
