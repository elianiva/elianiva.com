import type { ContributionsResponse } from "../lib/github.service";
import { Heading } from "~/components/ui/heading";
import { HeatmapGrid, COMPACT_WEEK_COUNT, type HeatmapCell } from "~/components/ui/heatmap-grid";
import { cn } from "~/lib/utils";

const TOTAL_CLASS =
  "text-4xl md:text-5xl font-mono font-bold text-pink-500 tracking-tight tabular-nums";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function toHeatmapLevel(level: string): number {
  const map: Record<string, number> = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  };
  return map[level] ?? 0;
}

function GitHubActivityGrid({ data }: { data: ContributionsResponse }) {
  const { totalContributions, weeks, longestStreak } = data;

  // The compact grid only draws the recent weeks, so it gets its own total.
  const compactTotal = weeks
    .slice(-COMPACT_WEEK_COUNT)
    .flatMap((week) => week.contributionDays)
    .reduce((sum, day) => sum + day.contributionCount, 0);

  const heatmapWeeks = weeks.map((week) => ({
    days: week.contributionDays.map(
      (day) =>
        ({
          date: day.date,
          intensity: toHeatmapLevel(day.contributionLevel),
          tooltip: `${day.date} · ${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"}`,
        }) as HeatmapCell,
    ),
  }));

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <div className="flex items-baseline gap-3">
          <span className={cn(TOTAL_CLASS, "sm:hidden")}>{formatNumber(compactTotal)}</span>
          <span className={cn(TOTAL_CLASS, "hidden sm:inline")}>
            {formatNumber(totalContributions)}
          </span>
          <span className="text-xs md:text-sm font-mono text-pink-950/50">
            <span className="sm:hidden">contributions · past 6 months</span>
            <span className="hidden sm:inline">contributions · past 365 days</span>
          </span>
        </div>
        <p className="text-xs md:text-sm font-mono text-pink-950/40">
          longest streak · {longestStreak}d
        </p>
      </div>
      <HeatmapGrid weeks={heatmapWeeks} />
    </>
  );
}

/**
 * Baked into the page at build time: the route loader reads the contributions
 * once while prerendering, so the browser never fetches them. Without a token
 * there is nothing to show, so the section is left out instead of printing a
 * setup hint into the public page.
 */
export function GitHubActivitySection({ data }: { data: ContributionsResponse | null }) {
  if (!data) return null;
  return (
    <section
      aria-labelledby="github-activity-heading"
      className="py-4 md:py-8 px-2 md:px-8 relative with-box-underline"
    >
      <div>
        <Heading level={2} id="github-activity-heading">
          Git Activity
        </Heading>
      </div>
      <GitHubActivityGrid data={data} />
    </section>
  );
}
