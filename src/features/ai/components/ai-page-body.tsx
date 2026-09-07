import { type AiUsage, type AiContribution, aggregateClients } from "../lib/types";
import * as DateTime from "effect/DateTime";
import { NotFound } from "~/components/not-found";
import { fmtTokens, fmtCost, fmtRel } from "~/lib/fmt";
import { SummarySection } from "./summary-section";
import { HeatmapSection } from "./heatmap-section";
import { ModelsSection } from "./models-section";
import { ClientsSection } from "./clients-section";
import { type HeatmapCell } from "~/components/ui/heatmap-grid";
import { Heading } from "~/components/ui/heading";

function groupContributions(contributions: AiContribution[]) {
  if (!contributions.length) return [];
  const weeksMap = new Map<number, HeatmapCell[]>();
  for (const day of contributions) {
    const dt = DateTime.toDate(DateTime.makeUnsafe(`${day.date}T00:00:00Z`));
    const dow = dt.getUTCDay();
    const sundayMs = dt.getTime() - dow * 86400000;
    const weekKey = sundayMs;
    if (!weeksMap.has(weekKey)) weeksMap.set(weekKey, Array(7).fill(null));
    const week = weeksMap.get(weekKey)!;
    week[dow] = {
      date: day.date,
      dateLabel: day.date,
      intensity: day.intensity ?? 0,
      tooltip: `${day.date} · ${fmtTokens(day.totals.tokens)} tokens · ${fmtCost(day.totals.cost)}`,
    };
  }
  const sortedWeeks = Array.from(weeksMap.entries())
    .slice()
    .sort(([a], [b]) => a - b)
    .map(([_, days]) => ({ days }));
  return sortedWeeks;
}

export function AiPage({ data }: { data: AiUsage | null }) {
  if (!data) {
    return (
      <NotFound
        path="ai"
        label="AI Usage"
        title="Couldn't reach tokscale"
        description="AI usage data is currently unavailable. Try again later."
        backTo={{ to: "/ai", label: "AI Usage" }}
      />
    );
  }

  const heatmapWeeks = groupContributions(data.contributions);
  const clientTotals = aggregateClients(data.contributions ?? []);
  const avgDaily = data.stats.activeDays > 0 ? data.stats.totalCost / data.stats.activeDays : 0;

  return (
    <div className="mx-auto max-w-container pt-10 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <div className="pb-8 with-box-underline relative">
          <Heading level={1}>AI Usage</Heading>
          <p className="text-pink-950/60 mt-4 leading-relaxed">
            All of AI tokens spent across{" "}
            <b className="text-pink-500 font-medium">{data.clients.length}</b> clients (
            {data.clients.join(", ")}). These data are all extracted by{" "}
            <a
              href={`https://tokscale.ai/u/${data.user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 underline decoration-pink-200 hover:decoration-pink-400"
            >
              tokscale.ai
            </a>
            .
          </p>
          <p className="text-pink-950/60 mt-1 leading-relaxed">
            <span className="font-mono text-sm text-foreground/60">
              last synced{" "}
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
          </p>
        </div>
        <section
          role="region"
          aria-labelledby="ai-summary-heading"
          className="relative with-box-underline"
        >
          <SummarySection data={data} avgDaily={avgDaily} />
        </section>
        <section
          role="region"
          aria-labelledby="ai-activity-heading"
          className="relative with-box-underline"
        >
          <HeatmapSection contributions={data.contributions ?? []} weeks={heatmapWeeks} />
        </section>
        <section
          role="region"
          aria-labelledby="ai-models-heading"
          className="relative with-box-underline"
        >
          <ModelsSection models={data.modelUsage} />
        </section>
        <section role="region" aria-labelledby="ai-clients-heading">
          <ClientsSection
            clientTotals={clientTotals}
            contributionsLength={data.contributions?.length ?? 0}
            totalCost={data.stats.totalCost}
          />
        </section>
      </div>
    </div>
  );
}
