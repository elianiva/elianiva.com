import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getGitHubContributions } from "~/lib/github";
import { useCountUp } from "~/hooks/use-count-up";
import { Heading } from "~/components/ui/heading";
import { AnimatedSection } from "~/components/ui/animated-section";
import { AnimatedItem } from "~/components/ui/animated-item";
import { HeatmapGrid, type HeatmapCell } from "~/components/ui/heatmap-grid";

function AnimatedCount({ target }: { target: number }) {
  const { ref, display } = useCountUp(target, 1.8);
  return (
    <span
      ref={ref}
      className="text-4xl md:text-5xl font-mono font-bold text-pink-500 tracking-tight tabular-nums"
    >
      {formatNumber(display)}
    </span>
  );
}

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

function GitHubActivityGrid() {
  const { data } = useSuspenseQuery({
    queryKey: ["github-contributions"],
    queryFn: () => getGitHubContributions(),
    staleTime: 1000 * 60 * 60 * 24,
  });

  if (!data) {
    return (
      <p className="text-sm font-body text-pink-950/60 pt-2">
        Set GH_TOKEN to fetch contribution data.
      </p>
    );
  }

  const { totalContributions, weeks, longestStreak } = data;

  const heatmapWeeks = weeks.map((week) => ({
    days: week.contributionDays.map(
      (day) =>
        ({
          date: day.date,
          dateLabel: day.date,
          intensity: toHeatmapLevel(day.contributionLevel),
          tooltip: `${day.date} · ${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"}`,
        }) as HeatmapCell,
    ),
  }));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <AnimatedCount target={totalContributions} />
          <span className="text-sm font-mono text-pink-950/50">contributions · past 365 days</span>
        </div>
        <div className="text-sm font-mono text-pink-950/40">longest streak · {longestStreak}d</div>
      </div>
      <HeatmapGrid weeks={heatmapWeeks} />
    </>
  );
}

export function GitHubActivitySection() {
  return (
    <AnimatedSection className="py-4 md:py-8 px-2 md:px-8 relative with-box-underline">
      <AnimatedItem>
        <Heading level={2} id="github-activity-heading">
          Git Activity
        </Heading>
      </AnimatedItem>

      <Suspense
        fallback={
          <div className="pt-2 pb-4">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-pink-950/20">
                0
              </span>
              <span className="text-sm font-mono text-pink-950/30">
                contributions · past 365 days
              </span>
            </div>
            <div className="pt-4 flex gap-0.75">
              {Array.from({ length: 53 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-0.75">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <div key={j} className="size-4 bg-pink-100/20 rounded-sm" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        }
      >
        <GitHubActivityGrid />
      </Suspense>
    </AnimatedSection>
  );
}
