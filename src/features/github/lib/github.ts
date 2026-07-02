import { Effect } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { runApp } from "~/lib/effect";
import { GitHubService } from "./github.service";

export const getGitHubPRs = createServerFn({ method: "GET" }).handler(() =>
  runApp(
    Effect.gen(function* () {
      const svc = yield* GitHubService;
      return yield* svc.getPRs();
    }),
  ),
);

export const getGitHubContributions = createServerFn({ method: "GET" }).handler(() =>
  runApp(
    Effect.gen(function* () {
      const svc = yield* GitHubService;
      return yield* svc.getContributions();
    }),
  ),
);
