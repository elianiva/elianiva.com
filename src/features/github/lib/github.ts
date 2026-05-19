import { Effect } from "effect"
import { createServerFn } from "@tanstack/react-start"
import { AppRuntime } from "~/lib/effect"
import { GitHub } from "./github.service"

export const getGitHubPRs = createServerFn({ method: "GET" }).handler(() =>
  AppRuntime.runPromise(
    Effect.gen(function*() {
      const svc = yield* GitHub
      return yield* svc.getPRs()
    }),
  ),
)

export const getGitHubContributions = createServerFn({ method: "GET" }).handler(() =>
  AppRuntime.runPromise(
    Effect.gen(function*() {
      const svc = yield* GitHub
      return yield* svc.getContributions()
    }),
  ),
)
