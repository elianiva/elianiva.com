import { Link } from "@tanstack/react-router";
import { BackButton } from "~/components/back-button";
import type { AiUsage, AiContribution } from "~/lib/tokscale";
import { useMemo } from "react";
import { fmtTokens, fmtCost, fmtRel } from "./fmt";
import { AiSummarySection } from "~/components/section/ai/ai-summary-section";
import { AiHeatmapSection } from "~/components/section/ai/ai-heatmap-section";
import { AiModelsSection } from "~/components/section/ai/ai-models-section";
import { AiClientsSection } from "~/components/section/ai/ai-clients-section";
import { type HeatmapCell } from "~/components/ui/heatmap-grid";
import { Heading } from "../ui/heading";

function groupContributions(contributions: AiContribution[]) {
  if (!contributions.length) return [];
  const weeksMap = new Map<number, HeatmapCell[]>();
  for (const day of contributions) {
    const dt = new Date(day.date + "T00:00:00Z");
    const dow = dt.getUTCDay();
    const sundayMs = dt.getTime() - dow * 86400000;
    const weekKey = sundayMs;
    if (!weeksMap.has(weekKey)) weeksMap.set(weekKey, Array(7).fill(null));
    const week = weeksMap.get(weekKey)!;
    week[dow] = {
      date: day.date,
      dateLabel: day.date,
      intensity: Math.min(4, day.intensity),
      tooltip: `${day.date} · ${fmtTokens(day.totals.tokens)} tokens · ${fmtCost(day.totals.cost)}`,
    };
  }
  const sortedWeeks = [...weeksMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([_, days]) => ({
      days: days.map((d) => d),
    }));
  return sortedWeeks;
}

function aggregateClients(clients: string[], contributions: AiContribution[]) {
  const m = new Map<string, { cost: number; tokens: number }>();
  for (const c of clients) m.set(c, { cost: 0, tokens: 0 });
  for (const day of contributions) {
    for (const c of day.clients) {
      const row = m.get(c.client) ?? { cost: 0, tokens: 0 };
      const tokenSum =
        c.tokens.input +
        c.tokens.output +
        c.tokens.cacheRead +
        c.tokens.cacheWrite +
        c.tokens.reasoning;
      m.set(c.client, { cost: row.cost + c.cost, tokens: row.tokens + tokenSum });
    }
  }
  return [...m.entries()].map(([client, v]) => ({ client, ...v })).sort((a, b) => b.cost - a.cost);
}

export function AiPageBody({ data }: { data: AiUsage }) {
  const contributions = data.contributions;

  const heatmapWeeks = useMemo(() => groupContributions(contributions), [contributions]);
  const clientTotals = useMemo(
    () => aggregateClients(data.clients, contributions),
    [data.clients, contributions],
  );
  const avgDaily = data.stats.activeDays > 0 ? data.stats.totalCost / data.stats.activeDays : 0;

  return (
    <div className="mx-auto max-w-container pt-10 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <header className="relative with-box-underline pb-8">
          <Heading level={1}>AI Usage</Heading>
          <p className="text-pink-950/60 mt-4 leading-relaxed">
            All of AI tokens spent across{" "}
            <b className="text-pink-500 font-medium">{data.clients.length}</b> clients (
            {data.clients.join(", ")}). These data are all extracted by{" "}
            <a
              href={`https://tokscale.ai/users/${data.user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 underline decoration-pink-200 hover:decoration-pink-400"
            >
              tokscale
            </a>{" "}
            not 100% representative of the actual cost as some of them comes from subscriptions.
          </p>
          <div className="flex gap-3 flex-wrap mt-4 font-mono text-sm text-pink-950/40">
            <span>
              rank <b className="text-pink-800 font-normal">#{data.user.rank}</b>
            </span>
            ·
            <span>
              range{" "}
              <b className="text-pink-800 font-normal">
                {data.dateRange.start} ~ {data.dateRange.end}
              </b>
            </span>
            ·
            <span>
              synced{" "}
              <b
                className={
                  data.freshness.isStale
                    ? "text-amber-600 font-normal"
                    : "text-pink-500 font-normal"
                }
              >
                {fmtRel(data.freshness.lastUpdated)}
              </b>
            </span>
          </div>
        </header>

        <section
          role="region"
          aria-labelledby="ai-summary-heading"
          className="relative with-box-underline"
        >
          <AiSummarySection data={data} avgDaily={avgDaily} />
        </section>
        <section
          role="region"
          aria-labelledby="ai-activity-heading"
          className="relative with-box-underline"
        >
          <AiHeatmapSection contributions={contributions} weeks={heatmapWeeks} />
        </section>
        <section
          role="region"
          aria-labelledby="ai-models-heading"
          className="relative with-box-underline"
        >
          <AiModelsSection models={data.modelUsage} />
        </section>
        <section role="region" aria-labelledby="ai-clients-heading">
          <AiClientsSection
            clientTotals={clientTotals}
            contributionsLength={contributions.length}
            totalCost={data.stats.totalCost}
          />
        </section>
      </div>
    </div>
  );
}
