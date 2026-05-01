import { cached, TTL } from "~/lib/cache";
import { createServerFn } from "@tanstack/react-start";
import type {
  GitHubPullRequest,
  GroupedPRs,
  GraphQLResponse,
  GitHubContributionsResponse,
  ContributionDay,
} from "./types";

const GITHUB_GRAPHQL_QUERY = `
  query($username: String!, $after: String) {
    user(login: $username) {
      pullRequests(first: 100, after: $after, states: MERGED, orderBy: {field: UPDATED_AT, direction: DESC}) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          number
          title
          state
          mergedAt
          createdAt
          updatedAt
          url
          repository {
            name
            nameWithOwner
            url
            stargazerCount
            isArchived
          }
          author {
            login
            url
          }
          additions
          deletions
          changedFiles
        }
      }
    }
  }
`;

async function fetchAllPRs(username: string, minStars: number): Promise<GitHubPullRequest[]> {
  const token = process.env.GH_TOKEN;
  if (!token) {
    console.warn("GH_TOKEN not set, cannot fetch GitHub PRs");
    return [];
  }

  const { Octokit } = await import("octokit");
  const octokit = new Octokit({ auth: token });

  const allPRs: GitHubPullRequest[] = [];
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage) {
    const response: GraphQLResponse = await octokit.graphql(GITHUB_GRAPHQL_QUERY, {
      username,
      after,
    });

    const prs = response.user.pullRequests.nodes;
    const pageInfo = response.user.pullRequests.pageInfo;

    for (const pr of prs) {
      if (pr.repository.isArchived) continue;
      if (pr.repository.stargazerCount < minStars) continue;

      allPRs.push({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.state.toLowerCase() as "open" | "closed" | "merged",
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

    hasNextPage = pageInfo.hasNextPage;
    after = pageInfo.endCursor;
  }

  return allPRs;
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

  const sorted = Object.entries(grouped).sort((a, b) => b[1].mergedCount - a[1].mergedCount);
  return Object.fromEntries(sorted);
}

export const getGitHubPRs = createServerFn({ method: "GET" }).handler(async () => {
  const username = "elianiva";
  const minStars = 5000;

  return cached("github-prs", TTL.long, async () => {
    const prs = await fetchAllPRs(username, minStars);
    const grouped = groupPRs(prs);
    return { grouped, totalPRs: prs.length };
  });
});

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

export const getGitHubContributions = createServerFn({ method: "GET" }).handler(async () => {
  const username = "elianiva";

  return cached("github-contributions", TTL.long, async () => {
    const token = process.env.GH_TOKEN;
    if (!token) {
      console.warn("GH_TOKEN not set, cannot fetch GitHub contributions");
      return null;
    }

    const { Octokit } = await import("octokit");
    const octokit = new Octokit({ auth: token });

    const response: GitHubContributionsResponse = await octokit.graphql(CONTRIBUTIONS_QUERY, {
      username,
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
});
