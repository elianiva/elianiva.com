import { Context, Duration, Effect, Layer } from "effect"
import { HttpClient } from "effect/unstable/http"
import { KvCache } from "~/lib/cache"
import type { AiUsage, AiContribution, AiModelUsage } from "./tokscale"

const USERNAME = "elianiva";

type RawResponse = {
  user: AiUsage["user"];
  stats: AiUsage["stats"];
  dateRange: AiUsage["dateRange"];
  updatedAt: string;
  submissionFreshness: { lastUpdated: string; cliVersion: string; isStale: boolean };
  clients: string[];
  models: string[];
  modelUsage: AiModelUsage[];
  contributions: AiContribution[];
};

function toAiUsage(d: RawResponse): AiUsage {
  return {
    user: d.user,
    stats: d.stats,
    dateRange: d.dateRange,
    updatedAt: d.updatedAt,
    freshness: {
      lastUpdated: d.submissionFreshness.lastUpdated,
      cliVersion: d.submissionFreshness.cliVersion,
      isStale: d.submissionFreshness.isStale,
    },
    clients: d.clients,
    models: d.models,
    modelUsage: d.modelUsage,
    contributions: d.contributions,
  };
}

export class Tokscale extends Context.Service<Tokscale, {
  readonly getUsage: () => Effect.Effect<AiUsage | null>
}>()("Tokscale") {
  static readonly layer = Layer.effect(
    Tokscale,
    Effect.gen(function*() {
      const client = yield* HttpClient.HttpClient
      const cache = yield* KvCache

      const getUsage = Effect.fn("Tokscale.getUsage")(function*() {
        const result = yield* cache.getOrSet("ai:tokscale", Duration.hours(6),
          Effect.gen(function*() {
            const resp = yield* client.get(`https://tokscale.ai/api/users/${USERNAME}`)
            if (resp.status !== 200) return null
            const d = yield* resp.json as Effect.Effect<RawResponse>
            return toAiUsage(d)
          }),
        ).pipe(
          Effect.catchTag("KvCacheError", () => Effect.succeed(null)),
          Effect.catchTag("HttpClientError", () => Effect.succeed(null)),
        )
        return result
      })

      return { getUsage }
    }),
  )
}
