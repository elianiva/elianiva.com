import { Schema } from "effect";
import { Island } from "../island";
import { sharedApi } from "../island/api";
import { StatusBoard, StatusBoardData } from "../ui/based-row";

/** The home page's live board; the rows known at build time come in as props. */
export const StatusTile = Island.define({
  component: () => import("../ui/based-row").then((m) => m.StatusTile),
  props: Schema.Struct({ board: StatusBoardData }),
  layers: [sharedApi],
  fallback: (h, { board }) => StatusBoard(h, { activity: null, now: null, board }),
});
