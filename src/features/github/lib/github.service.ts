import { Context, Duration, Effect, Layer, Redacted } from "effect";
import { Octokit } from "octokit";
import { KvCache } from "~/lib/cache";
import * as E from "~/lib/errors";
import { GH_TOKEN } from "~/lib/env";
import type {
  GitHubPullRequest,
  GroupedPRs,
  PRContributionsResponse,
  GitHubContributionsResponse,
  ContributionDay,
} from "./types";

const PR_CONTRIBUTIONS_QUERY = `
  query($username: String!, $from: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from) {
        pullRequestContributionsByRepository(maxRepositories: 100) {
          repository {
            name
            nameWithOwner
            url
            stargazerCount
          }
          contributions(first: 100) {
            nodes {
              pullRequest {
                id
                number
                title
                state
                mergedAt
                createdAt
                updatedAt
                url
                additions
                deletions
                changedFiles
                repository {
                  name
                  nameWithOwner
                  url
                  stargazerCount
                }
                author {
                  login
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;

function fetchAllPRs(
  octokit: Octokit,
  username: string,
  minStars: number,
): Effect.Effect<GitHubPullRequest[], E.GitHubError> {
  return Effect.gen(function* () {
    const response: PRContributionsResponse = yield* Effect.tryPromise({
      try: () =>
        octokit.graphql(PR_CONTRIBUTIONS_QUERY, {
          username,
          from: "2020-01-01T00:00:00Z",
        }) as Promise<PRContributionsResponse>,
      catch: (e) => new E.GitHubError({ message: String(e) }),
    });

    const repoContribs = response.user.contributionsCollection.pullRequestContributionsByRepository;
    const allPRs: GitHubPullRequest[] = [];

    for (const repo of repoContribs) {
      if (repo.repository.stargazerCount < minStars) continue;

      for (const node of repo.contributions.nodes) {
        if (!node || node.pullRequest.state !== "MERGED") continue;
        const pr = node.pullRequest;

        allPRs.push({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          state: "merged",
          merged_at: pr.mergedAt,
          created_at: pr.createdAt,
          updated_at: pr.updatedAt,
          url: pr.url,
          repository: {
            name: pr.repository.name,
            full_name: pr.repository.nameWithOwner,
            url: pr.repository.url,
            stargazerCount: pr.repository.stargazerCount,
          },
          user: {
            login: pr.author.login,
            url: pr.author.url,
          },
          additions: pr.additions,
          deletions: pr.deletions,
          changed_files: pr.changedFiles,
        });
      }
    }

    return allPRs;
  });
}

function groupPRs(prs: GitHubPullRequest[]): GroupedPRs {
  const grouped: GroupedPRs = {};

  for (const pr of prs) {
    const repoName = pr.repository.name;
    if (!grouped[repoName]) {
      grouped[repoName] = {
        repository: pr.repository,
        prs: [],
        mergedCount: 0,
      };
    }
    grouped[repoName].prs.push(pr);
    grouped[repoName].mergedCount++;
  }

  const entries = Object.entries(grouped);
  const maxPRs = Math.max(...entries.map(([, g]) => g.mergedCount), 1);
  const maxStars = Math.max(...entries.map(([, g]) => g.repository.stargazerCount), 1);

  const STAR_RATIO = 0.5;
  const PR_RATIO = 0.5;
  const sorted = entries.sort((a, b) => {
    const sa =
      STAR_RATIO * (a[1].mergedCount / maxPRs) +
      PR_RATIO * (a[1].repository.stargazerCount / maxStars);
    const sb =
      STAR_RATIO * (b[1].mergedCount / maxPRs) +
      PR_RATIO * (b[1].repository.stargazerCount / maxStars);
    return sb - sa;
  });
  return Object.fromEntries(sorted);
}

const CONTRIBUTIONS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

function fetchContributions(
  octokit: Octokit,
  username: string,
): Effect.Effect<ContributionsResponse, E.GitHubError> {
  return Effect.gen(function* () {
    const response: GitHubContributionsResponse = yield* Effect.tryPromise({
      try: () =>
        octokit.graphql(CONTRIBUTIONS_QUERY, { username }) as Promise<GitHubContributionsResponse>,
      catch: (e) => new E.GitHubError({ message: String(e) }),
    });

    const calendar = response.user.contributionsCollection.contributionCalendar;

    let longestStreak = 0;
    let currentStreak = 0;
    const allDays: ContributionDay[] = [];
    for (const week of calendar.weeks) {
      for (const day of week.contributionDays) {
        allDays.push(day);
      }
    }
    for (const day of allDays) {
      if (day.contributionCount > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks,
      longestStreak,
    };
  });
}

type ContributionsResponse = {
  totalContributions: number;
  weeks: GitHubContributionsResponse["user"]["contributionsCollection"]["contributionCalendar"]["weeks"];
  longestStreak: number;
};

const USERNAME = "elianiva";
const MIN_STARS = 500;

interface GithubServiceShape {
  readonly getPRs: () => Effect.Effect<{ grouped: GroupedPRs; totalPRs: number }>;
  readonly getContributions: () => Effect.Effect<ContributionsResponse | null>;
}

export class GitHubService extends Context.Service<GitHubService, GithubServiceShape>()("GitHub") {
  static readonly layer = Layer.effect(
    GitHubService,
    Effect.gen(function* () {
      const tokenRedacted = yield* GH_TOKEN;
      const token = Redacted.value(tokenRedacted);
      const cache = yield* KvCache;
      const octokit = new Octokit({ auth: token || undefined });

      const getPRs = Effect.fn("GitHub.getPRs")(function* () {
        if (!token) return { grouped: {}, totalPRs: 0 };
        const result = yield* cache
          .getOrSet(
            "github-prs",
            Duration.hours(24),
            Effect.gen(function* () {
              const prs = yield* fetchAllPRs(octokit, USERNAME, MIN_STARS);
              return { grouped: groupPRs(prs), totalPRs: prs.length };
            }).pipe(
              Effect.catchTag("GitHubError", () => Effect.succeed({ grouped: {}, totalPRs: 0 })),
            ),
          )
          .pipe(
            Effect.catchTag("KvCacheError", () => Effect.succeed({ grouped: {}, totalPRs: 0 })),
          );
        return result;
      });

      const getContributions = Effect.fn("GitHub.getContributions")(function* () {
        if (!token) return null;
        const result = yield* cache
          .getOrSet(
            "github-contributions",
            Duration.hours(24),
            Effect.gen(function* () {
              const result = yield* fetchContributions(octokit, USERNAME);
              return result;
            }).pipe(Effect.catchTag("GitHubError", () => Effect.succeed(null))),
          )
          .pipe(Effect.catchTag("KvCacheError", () => Effect.succeed(null)));
        return result;
      });

      return { getPRs, getContributions };
    }),
  );
}
