import { Query } from "@effect/ui";
import { Effect, Schema } from "effect";
import { ContributionsResponse } from "../features/github/types";
import { JsonApi, readOr } from "./JsonApi";

/**
 * The past year's GitHub contribution calendar, or `null` when there is none
 * (no token, or GitHub did not answer). The home page's heatmap shows it, and
 * it is the one query the prerender runs, so crawlers read the heatmap. The
 * count moves a day at a time, and the deploy workflow rebuilds daily, so it
 * stays fresh for as long as a visit lasts.
 */
export class GetContributions extends Query.Service<GetContributions>()("github/GetContributions", {
  success: Schema.NullOr(ContributionsResponse),
  staleTime: "Infinity",
}) {
  static readonly layer = this.toLayer(
    Effect.gen(function* () {
      const api = yield* JsonApi;
      return () =>
        readOr(api, "/api/github/contributions", Schema.NullOr(ContributionsResponse), null);
    }),
  );
}
