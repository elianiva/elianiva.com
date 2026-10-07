import { createServerFn } from "@tanstack/react-start";
import { Effect, Layer, ManagedRuntime } from "effect";
import { KvCache } from "~/lib/cache";
import { GitHubService } from "./github.service";

/**
 * Server-only GitHub reads. The token lives in the Worker's env and is read
 * per request inside the handler — it never reaches the client bundle, the
 * browser only ever receives the returned data.
 *
 * Without `GH_TOKEN` the service degrades to empty data, so the sections
 * render their empty states instead of failing.
 */
export const fetchGitHubPRs = createServerFn().handler(async () => {
  const token = process.env.GH_TOKEN ?? "";
  const live = GitHubService.layerFromToken(token).pipe(
    Layer.provideMerge(KvCache.layerFrom(undefined)),
  );
  const runtime = ManagedRuntime.make(live);
  return runtime.runPromise(
    Effect.gen(function* () {
      const service = yield* GitHubService;
      return yield* service.getPRs();
    }),
  );
});

export const fetchGitHubContributions = createServerFn().handler(async () => {
  const token = process.env.GH_TOKEN ?? "";
  const live = GitHubService.layerFromToken(token).pipe(
    Layer.provideMerge(KvCache.layerFrom(undefined)),
  );
  const runtime = ManagedRuntime.make(live);
  return runtime.runPromise(
    Effect.gen(function* () {
      const service = yield* GitHubService;
      return yield* service.getContributions();
    }),
  );
});

/**
 * Client-side GitHub reads. These call the server functions above, so the
 * token stays on the server — the browser only fetches the results.
 */
export function getGitHubPRs() {
  return fetchGitHubPRs();
}

export function getGitHubContributions() {
  return fetchGitHubContributions();
}
