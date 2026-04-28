import { createServerFn } from "@tanstack/react-start";
import { env } from "#/env";
import type { GitHubPullRequest, GroupedPRs, GraphQLResponse } from "~/types/github-pr";

type Entry<T> = { value: T; at: number };

const store = new Map<string, Entry<unknown>>();

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && Date.now() - hit.at < ttlMs) return hit.value;
  try {
    const value = await load();
    store.set(key, { value, at: Date.now() });
    return value;
  } catch (err) {
    if (hit) return hit.value;
    throw err;
  }
}

export const TTL = {
  live: 1000 * 20, // 20s
  short: 1000 * 60 * 5, // 5m
  medium: 1000 * 60 * 30, // 30m
  long: 1000 * 60 * 60 * 6, // 6h
};

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

export const getGitHubPRs = createServerFn({ method: "GET" }).handler(async () => {
  const username = "elianiva";
  const minStars = 5000;

  return cached(
    "github-prs",
    TTL.long,
    async () => {
      const prs = await fetchAllPRs(username, minStars);
      const grouped = groupPRs(prs);
      return { grouped, totalPRs: prs.length };
    },
  );
});
