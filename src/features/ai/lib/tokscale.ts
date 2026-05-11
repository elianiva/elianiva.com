import { createServerFn } from "@tanstack/react-start";
import { cached, TTL } from "~/lib/cache";

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

export const getAiUsage = createServerFn({ method: "GET" }).handler((): Promise<AiUsage | null> =>
  cached("ai:tokscale", TTL.long, async () => {
    const res = await fetch(`https://tokscale.ai/api/users/${USERNAME}`);
    if (!res.ok) return null;
    const d = (await res.json()) as {
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
  }),
);
