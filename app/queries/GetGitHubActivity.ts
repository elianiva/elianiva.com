import { Query } from "@effect/ui";
import { Effect } from "effect";
import {
  activityUrl,
  emptyActivity,
  GitHubActivity,
  parseActivity,
} from "../features/github/activity";
import { JsonApi } from "./JsonApi";

/**
 * My latest public push, release and star. GitHub's events API is
 * unauthenticated, so a rate limit gives the empty activity and the rows that
 * need it stay out. Components that show it are kept off the server render.
 */
export class GetGitHubActivity extends Query.Service<GetGitHubActivity>()(
  "github/GetGitHubActivity",
  { success: GitHubActivity, staleTime: "5 minutes" },
) {
  static readonly layer = this.toLayer(
    Effect.gen(function* () {
      const api = yield* JsonApi;
      return () =>
        api.get(activityUrl).pipe(
          Effect.map((body) => parseActivity(body)),
          Effect.orElseSucceed(() => emptyActivity),
        );
    }),
  );
}
