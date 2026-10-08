import { Context, Duration, Effect, Layer } from "effect";
import { Octokit } from "octokit";
import { KvCache } from "~/lib/cache";
import type {
  GitHubPullRequest,
  GroupedPRs,
  RepositoryContributions,
  PRContributionsResponse,
  GitHubContributionsResponse,
  ContributionDay,
} from "./types";

const PR_CONTRIBUTIONS_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
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

const DAY_MS = 86_400_000;
const USERNAME = "elianiva";

/**
 * GitHub reads `from` as the start of a one-year window, so a far-past `from`
 * answers with that year instead of everything since. Anchoring the window to the
 * trailing 365 days is what makes this list reflect current work.
 */
const WINDOW_DAYS = 365;

/** Below this a project is too small to tell a visitor anything. */
const MIN_STARS = 100;

function trailingYear(now: number): { from: string; to: string } {
  return {
    from: new Date(now - WINDOW_DAYS * DAY_MS).toISOString(),
    to: new Date(now).toISOString(),
  };
}

function isWorthListing(fullName: string, stargazerCount: number): boolean {
  // Personal repositories are covered by the projects section, and a project of
  // yours is not evidence that other maintainers accepted your work.
  const owner = fullName.split("/")[0];
  return owner !== USERNAME && stargazerCount >= MIN_STARS;
}

export function decodePRs(
  response: PRContributionsResponse,
): Effect.Effect<GitHubPullRequest[], Error> {
  const repoContribs =
    response?.user?.contributionsCollection?.pullRequestContributionsByRepository;
  if (!Array.isArray(repoContribs)) {
    return Effect.fail(new Error("unexpected GitHub PR contributions shape"));
  }
  const allPRs: GitHubPullRequest[] = [];

  for (const repo of repoContribs) {
    const repository = repo?.repository;
    if (
      !repository ||
      typeof repository.nameWithOwner !== "string" ||
      typeof repository.stargazerCount !== "number"
    ) {
      continue;
    }
    if (!isWorthListing(repository.nameWithOwner, repository.stargazerCount)) continue;

    const nodes = repo?.contributions?.nodes;
    if (!Array.isArray(nodes)) continue;
    for (const node of nodes) {
      const pr = node?.pullRequest;
      if (!pr || pr.state !== "MERGED") continue;
      if (!pr.repository || !pr.author) continue;

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

  return Effect.succeed(allPRs);
}

function fetchAllPRs(
  octokit: Octokit,
  username: string,
  now: number,
): Effect.Effect<GitHubPullRequest[], Error> {
  return Effect.gen(function* () {
    const { from, to } = trailingYear(now);
    const response: PRContributionsResponse = yield* Effect.tryPromise({
      try: () =>
        octokit.graphql(PR_CONTRIBUTIONS_QUERY, {
          username,
          from,
          to,
        }) as Promise<PRContributionsResponse>,
      catch: (e) => new Error(String(e)),
    });

    return yield* decodePRs(response);
  });
}

function mergedAt(pr: GitHubPullRequest): string {
  return pr.merged_at ?? pr.updated_at;
}

function mergedTime(pr: GitHubPullRequest): number {
  return Date.parse(mergedAt(pr));
}

/**
 * Groups by repository, newest merge first. The API returns repositories and pull
 * requests ordered by contribution count, which buries what a visitor is actually
 * working on, so both levels are re-sorted by merge date here.
 */
function groupPRs(prs: GitHubPullRequest[]): GroupedPRs {
  const byRepository = new Map<string, GitHubPullRequest[]>();
  for (const pr of prs) {
    const existing = byRepository.get(pr.repository.full_name);
    if (existing) {
      existing.push(pr);
    } else {
      byRepository.set(pr.repository.full_name, [pr]);
    }
  }

  const groups: RepositoryContributions[] = [];
  for (const repoPRs of byRepository.values()) {
    const newestFirst = [...repoPRs].sort((a, b) => mergedTime(b) - mergedTime(a));
    groups.push({
      repository: newestFirst[0].repository,
      prs: newestFirst,
      mergedCount: newestFirst.length,
      lastMergedAt: mergedAt(newestFirst[0]),
    });
  }

  return groups.sort(
    (a, b) =>
      Date.parse(b.lastMergedAt) - Date.parse(a.lastMergedAt) ||
      b.repository.stargazerCount - a.repository.stargazerCount,
  );
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

export function decodeContributions(
  response: GitHubContributionsResponse,
): Effect.Effect<ContributionsResponse, Error> {
  // A malformed shape here used to throw a synchronous `TypeError` — an
  // Effect defect, not a failure — which skipped the `Effect.match`
  // fallback in `KvCache.getOrElse`, escaped the server function, and
  // surfaced in the browser as `["github-contributions"] data is
  // undefined`. Validate instead so every bad shape degrades to the
  // fallback through the normal error channel.
  const calendar = response?.user?.contributionsCollection?.contributionCalendar;
  if (
    !calendar ||
    typeof calendar.totalContributions !== "number" ||
    !Array.isArray(calendar.weeks)
  ) {
    return Effect.fail(new Error("unexpected GitHub contributions shape"));
  }

  let longestStreak = 0;
  let currentStreak = 0;
  const allDays: ContributionDay[] = [];
  for (const week of calendar.weeks) {
    if (!Array.isArray(week?.contributionDays)) continue;
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

  return Effect.succeed({
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks,
    longestStreak,
  });
}

function fetchContributions(
  octokit: Octokit,
  username: string,
): Effect.Effect<ContributionsResponse, Error> {
  return Effect.gen(function* () {
    const response: GitHubContributionsResponse = yield* Effect.tryPromise({
      try: () =>
        octokit.graphql(CONTRIBUTIONS_QUERY, { username }) as Promise<GitHubContributionsResponse>,
      catch: (e) => new Error(String(e)),
    });

    return yield* decodeContributions(response);
  });
}

type ContributionsResponse = {
  totalContributions: number;
  weeks: GitHubContributionsResponse["user"]["contributionsCollection"]["contributionCalendar"]["weeks"];
  longestStreak: number;
};

const EMPTY_PRS: { grouped: GroupedPRs; totalPRs: number } = { grouped: [], totalPRs: 0 };

interface GithubServiceShape {
  readonly getPRs: () => Effect.Effect<{ grouped: GroupedPRs; totalPRs: number }>;
  readonly getContributions: () => Effect.Effect<ContributionsResponse | null>;
}

export class GitHubService extends Context.Service<GitHubService, GithubServiceShape>()("GitHub") {
  /**
   * Builds the service from an explicit token. Server functions pass
   * `process.env.GH_TOKEN` read per request; an empty token degrades every
   * read to empty data, decided once here.
   */
  static layerFromToken(token: string) {
    return Layer.effect(
      GitHubService,
      Effect.gen(function* () {
        // No credentials → every read degrades to empty data, decided once here.
        if (!token) {
          return {
            getPRs: () => Effect.succeed(EMPTY_PRS),
            getContributions: () => Effect.succeed(null),
          };
        }

        const cache = yield* KvCache;
        const octokit = new Octokit({ auth: token });

        const getPRs = Effect.fn("GitHub.getPRs")(function* () {
          return yield* cache.getOrElse({
            key: "github-prs:v2",
            ttl: Duration.hours(24),
            fallback: EMPTY_PRS,
            load: Effect.gen(function* () {
              const prs = yield* fetchAllPRs(octokit, USERNAME, Date.now());
              return { grouped: groupPRs(prs), totalPRs: prs.length };
            }),
          });
        });

        const getContributions = Effect.fn("GitHub.getContributions")(function* () {
          return yield* cache.getOrElse({
            key: "github-contributions",
            ttl: Duration.hours(24),
            fallback: null,
            load: fetchContributions(octokit, USERNAME),
          });
        });

        return { getPRs, getContributions };
      }),
    );
  }
}
