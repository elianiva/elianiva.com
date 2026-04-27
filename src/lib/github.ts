import { createServerFn } from "@tanstack/react-start";
import { env } from "#/env";
import type { GitHubPullRequest, GroupedPRs, GraphQLResponse } from "#/types/github-pr";

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
  const token = env.GH_TOKEN;
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

export function formatStarCount(count: number): string {
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (count >= 1_000) return (count / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(count);
}

export function formatChanges(additions: number, deletions: number): string {
  const total = additions + deletions;
  if (total >= 1_000) return (total / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(total);
}

export const getGitHubPRs = createServerFn({ method: "GET" }).handler(async () => {
  const username = "elianiva";
  const minStars = 10;

  if (process.env.NODE_ENV === "development") {
    try {
      const fs = await import("node:fs/promises");
      const cachePath = ".cache/github-prs.json";
      const cached = await fs.readFile(cachePath, "utf-8").catch(() => null);
      if (cached) {
        const data = JSON.parse(cached);
        const age = Date.now() - data.cachedAt;
        if (age < 60 * 60 * 1000) {
          return {
            grouped: data.grouped as GroupedPRs,
            totalPRs: data.totalPRs as number,
          };
        }
      }
    } catch {
      // ignore cache errors
    }
  }

  const prs = await fetchAllPRs(username, minStars);
  const grouped = groupPRs(prs);

  if (process.env.NODE_ENV === "development") {
    try {
      const fs = await import("node:fs/promises");
      await fs.mkdir(".cache", { recursive: true });
      await fs.writeFile(
        ".cache/github-prs.json",
        JSON.stringify({ grouped, totalPRs: prs.length, cachedAt: Date.now() }, null, 2),
      );
    } catch {
      // ignore cache write errors
    }
  }

  return { grouped, totalPRs: prs.length };
});
