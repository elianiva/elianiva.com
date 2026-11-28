import { Schema } from "effect";
import { Island } from "../island";

export const Quiz = Island.define({
  component: () => import("../ui/quiz").then((m) => m.Quiz),
  props: Schema.Struct({ id: Schema.String }),
});
