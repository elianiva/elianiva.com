import { Schema } from "effect";
import { Island } from "../island";

export const Comments = Island.define({
  component: () => import("../ui/comments").then((m) => m.Comments),
  props: Schema.Struct({}),
});
