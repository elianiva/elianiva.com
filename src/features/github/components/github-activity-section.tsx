import type { ContributionsResponse } from "../lib/github.service";

/**
 * A year of blank days ending today, for when there is no data (no token at
 * build time, or the fetch failed). The heatmap keeps its shape, faded.
 */
export function emptyContributions(now: Date = new Date()): ContributionsResponse {
  const DAY_MS = 86_400_000;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const start = today - 364 * DAY_MS;
  const weeks: ContributionsResponse["weeks"] = [];
  for (let t = start; t <= today; t += DAY_MS) {
    if (weeks.length === 0 || new Date(t).getUTCDay() === 0) weeks.push({ contributionDays: [] });
    weeks[weeks.length - 1].contributionDays.push({
      date: new Date(t).toISOString().slice(0, 10),
      contributionCount: 0,
      contributionLevel: "NONE",
    });
  }
  return { totalContributions: 0, weeks, longestStreak: 0 };
}
