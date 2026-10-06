import { Effect } from "effect";
import { runtime } from "~/lib/effect";
import { GitHubService } from "./github.service";

/**
 * Client-side GitHub reads. Same query shapes as before, executed from the
 * browser through the client Effect runtime (`~/lib/effect`). Without
 * `VITE_GH_TOKEN` the service degrades to empty data — the sections render
 * their empty states instead of failing.
 */
export function getGitHubPRs() {
  return runtime.runPromise(
    Effect.gen(function* () {
      const svc = yield* GitHubService;
      return yield* svc.getPRs();
    }),
  );
}

export function getGitHubContributions() {
  return runtime.runPromise(
    Effect.gen(function* () {
      const svc = yield* GitHubService;
      return yield* svc.getContributions();
    }),
  );
}
