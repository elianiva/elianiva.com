import { Effect } from "effect"
import { createServerFn } from "@tanstack/react-start"
import { AppRuntime } from "~/lib/effect"
import { Tokscale } from "./tokscale.service"

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

export const getAiUsage = createServerFn({ method: "GET" }).handler(() =>
  AppRuntime.runPromise(
    Effect.gen(function*() {
      const svc = yield* Tokscale
      return yield* svc.getUsage()
    }),
  ),
)
