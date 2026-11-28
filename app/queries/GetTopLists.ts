import { Query } from "@effect/ui";
import { Effect } from "effect";
import { emptyTopLists, TopListsData } from "../features/music/types";
import { JsonApi, readOr } from "./JsonApi";

/** Top artists, albums and tracks, for the last year and all time. */
export class GetTopLists extends Query.Service<GetTopLists>()("music/GetTopLists", {
  success: TopListsData,
  staleTime: "1 hour",
}) {
  static readonly layer = this.toLayer(
    Effect.gen(function* () {
      const api = yield* JsonApi;
      return () => readOr(api, "/api/music/top", TopListsData, emptyTopLists);
    }),
  );
}
