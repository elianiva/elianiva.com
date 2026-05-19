import { Context, Duration, Effect, Layer } from "effect"
import { HttpClient, HttpClientResponse } from "effect/unstable/http"
import { createServerFn } from "@tanstack/react-start"
import { KvCache } from "~/lib/cache"
import { AppRuntime } from "~/lib/effect"
import * as E from "~/lib/errors"

export function aggregateClients(contributions: AiContribution[]) {
  const map = new Map<string, { cost: number; tokens: number }>();
  for (const day of contributions) {
    if (!day.clients) continue;
    for (const c of day.clients) {
      const entry = map.get(c.client) || { cost: 0, tokens: 0 };
      entry.cost += c.cost;
      entry.tokens +=
        c.tokens.input + c.tokens.output + c.tokens.cacheRead + c.tokens.cacheWrite + c.tokens.reasoning;
      map.set(c.client, entry);
    }
  }
  return [...map.entries()]
    .map(([client, totals]) => ({ client, ...totals }))
    .sort((a, b) => b.tokens - a.tokens);
}

export type AiModelUsage = {
  model: string;
  tokens: number;
  cost: number;
  percentage: number;
};

export type AiContribution = {
  date: string;
  totals: { tokens: number; cost: number; messages: number };
  intensity: number;
  tokenBreakdown: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    reasoning: number;
  };
  clients: Array<{
    client: string;
    tokens: { input: number; output: number; cacheRead: number; cacheWrite: number; reasoning: number };
    cost: number;
    messages: number;
    models: Record<
      string,
      { cost: number; input: number; output: number; tokens: number; messages: number; cacheRead: number; reasoning: number; cacheWrite: number }
    >;
  }>;
};

export type AiUsage = {
  user: { username: string; displayName: string; avatarUrl: string; rank: number; createdAt: string };
  stats: {
    totalTokens: number;
    totalCost: number;
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    reasoningTokens: number;
    submissionCount: number;
    activeDays: number;
  };
  dateRange: { start: string; end: string };
  updatedAt: string;
  freshness: { lastUpdated: string; cliVersion: string; isStale: boolean };
  clients: string[];
  models: string[];
  modelUsage: AiModelUsage[];
  contributions: AiContribution[];
};

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
  readonly getUsage: Effect.Effect<AiUsage | null, E.TokscaleError>
}>()("Tokscale") {
  static readonly layer = Layer.effect(
    Tokscale,
    Effect.gen(function*() {
      const client = yield* HttpClient.HttpClient
      const cache = yield* KvCache

      return {
        getUsage: Effect.fn("Tokscale.getUsage")(function*() {
          return yield* cache.getOrSet("ai:tokscale", Duration.hours(6),
            Effect.gen(function*() {
              const resp = yield* client.get(`https://tokscale.ai/api/users/${USERNAME}`)
              if (resp.status !== 200) return null
              const d = yield* HttpClientResponse.json(resp) as Effect.Effect<RawResponse>
              return toAiUsage(d)
            }).pipe(
              Effect.catchTag("HttpClientError", () => Effect.succeed(null)),
              Effect.catchTag("KvCacheError", () => Effect.succeed(null)),
            ),
          )
        }),
      }
    }),
  )
}

export const getAiUsage = createServerFn({ method: "GET" }).handler(() =>
  AppRuntime.runPromise(
    Effect.gen(function*() {
      const svc = yield* Tokscale
      return yield* svc.getUsage
    }),
  ),
)
