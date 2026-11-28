import { Schema } from "effect";

/**
 * The shapes of the Api Worker's GitHub routes, as Schemas. A query's result is
 * encoded into the server render's state, so it needs a Schema, and the types
 * come from it. They match `src/features/github/lib/types.ts`, which the Worker
 * keeps using.
 */

const Repository = Schema.Struct({
  name: Schema.String,
  full_name: Schema.String,
  url: Schema.String,
  stargazerCount: Schema.Number,
});

export const GitHubPullRequest = Schema.Struct({
  id: Schema.String,
  number: Schema.Number,
  title: Schema.String,
  state: Schema.Literals(["open", "closed", "merged"]),
  merged_at: Schema.NullOr(Schema.String),
  created_at: Schema.String,
  updated_at: Schema.String,
  url: Schema.String,
  repository: Repository,
  user: Schema.Struct({ login: Schema.String, url: Schema.String }),
  additions: Schema.Number,
  deletions: Schema.Number,
  changed_files: Schema.Number,
});
export type GitHubPullRequest = typeof GitHubPullRequest.Type;

export const RepositoryContributions = Schema.Struct({
  repository: Repository,
  prs: Schema.Array(GitHubPullRequest),
  mergedCount: Schema.Number,
  /** ISO timestamp of the newest merged pull request in the repository. */
  lastMergedAt: Schema.String,
});
export type RepositoryContributions = typeof RepositoryContributions.Type;

/** One entry per repository, most recently merged first. */
export const PrsResponse = Schema.Struct({
  grouped: Schema.Array(RepositoryContributions),
  totalPRs: Schema.Number,
});
export type PrsResponse = typeof PrsResponse.Type;

export const emptyPrs: PrsResponse = { grouped: [], totalPRs: 0 };

export const ContributionDay = Schema.Struct({
  date: Schema.String,
  contributionCount: Schema.Number,
  contributionLevel: Schema.Literals([
    "NONE",
    "FIRST_QUARTILE",
    "SECOND_QUARTILE",
    "THIRD_QUARTILE",
    "FOURTH_QUARTILE",
  ]),
});
export type ContributionDay = typeof ContributionDay.Type;

export const ContributionsResponse = Schema.Struct({
  totalContributions: Schema.Number,
  weeks: Schema.Array(Schema.Struct({ contributionDays: Schema.Array(ContributionDay) })),
  longestStreak: Schema.Number,
});
export type ContributionsResponse = typeof ContributionsResponse.Type;

/**
 * A year of blank days ending today, for when there is no data (no token at
 * build time, or the fetch failed). The heatmap keeps its shape, faded.
 */
export function emptyContributions(now: Date = new Date()): ContributionsResponse {
  const DAY_MS = 86_400_000;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const start = today - 364 * DAY_MS;
  const weeks: { contributionDays: ContributionDay[] }[] = [];
  for (let t = start; t <= today; t += DAY_MS) {
    if (weeks.length === 0 || new Date(t).getUTCDay() === 0) weeks.push({ contributionDays: [] });
    weeks[weeks.length - 1]!.contributionDays.push({
      date: new Date(t).toISOString().slice(0, 10),
      contributionCount: 0,
      contributionLevel: "NONE",
    });
  }
  return { totalContributions: 0, weeks, longestStreak: 0 };
}
