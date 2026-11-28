import { Query } from "@effect/ui";
import { Effect } from "effect";
import { emptyPrs, PrsResponse } from "../features/github/types";
import { JsonApi, readOr } from "./JsonApi";

/** Merged pull requests in other people's projects over the last year, by repository. */
export class GetGitHubPrs extends Query.Service<GetGitHubPrs>()("github/GetGitHubPrs", {
  success: PrsResponse,
  staleTime: "1 hour",
}) {
  static readonly layer = this.toLayer(
    Effect.gen(function* () {
      const api = yield* JsonApi;
      return () => readOr(api, "/api/github/prs", PrsResponse, emptyPrs);
    }),
  );
}
