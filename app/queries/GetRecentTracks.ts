import { Query } from "@effect/ui";
import { Effect } from "effect";
import { emptyMusic, MusicData } from "../features/music/types";
import { JsonApi, readOr } from "./JsonApi";

/** The latest scrobbles. Empty when last.fm did not answer. */
export class GetRecentTracks extends Query.Service<GetRecentTracks>()("music/GetRecentTracks", {
  success: MusicData,
  staleTime: "2 minutes",
}) {
  static readonly layer = this.toLayer(
    Effect.gen(function* () {
      const api = yield* JsonApi;
      return () => readOr(api, "/api/music/recent", MusicData, emptyMusic);
    }),
  );
}
