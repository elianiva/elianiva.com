import { Config, Context, Duration, Effect, Layer, Redacted } from "effect"
import { Octokit } from "octokit"
import { KvCache } from "~/lib/cache"
import * as E from "~/lib/errors"
import type {
  GitHubPullRequest,
  GroupedPRs,
  GraphQLResponse,
  GitHubContributionsResponse,
  ContributionDay,
} from "./types"

const GITHUB_SEARCH_QUERY = `
  query($searchQuery: String!, $after: String) {
    search(query: $searchQuery, type: ISSUE, first: 100, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ... on PullRequest {
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
`

function fetchAllPRs(octokit: Octokit, username: string, minStars: number): Effect.Effect<GitHubPullRequest[], E.GitHubError> {
  return Effect.gen(function*() {
    const allPRs: GitHubPullRequest[] = []
    let hasNextPage = true
    let after: string | null = null
    let pagesFetched = 0
    const MAX_PAGES = 2
    const searchQuery = `author:${username} is:pr is:merged archived:false`

    while (hasNextPage && pagesFetched < MAX_PAGES) {
      const response: GraphQLResponse = yield* Effect.tryPromise({
        try: () => octokit.graphql(GITHUB_SEARCH_QUERY, { searchQuery, after }) as Promise<GraphQLResponse>,
        catch: (e) => new E.GitHubError({ message: String(e) }),
      })

      const prs = response.search.nodes.filter((n): n is NonNullable<typeof n> => n !== null)
      const pageInfo = response.search.pageInfo

      for (const pr of prs) {
        if (pr.repository.stargazerCount < minStars) continue

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
        })
      }

      hasNextPage = pageInfo.hasNextPage
      after = pageInfo.endCursor
      pagesFetched++
    }

    return allPRs
  })
}

function groupPRs(prs: GitHubPullRequest[]): GroupedPRs {
  const grouped: GroupedPRs = {}

  for (const pr of prs) {
    const repoName = pr.repository.name
    if (!grouped[repoName]) {
      grouped[repoName] = {
        repository: pr.repository,
        prs: [],
        mergedCount: 0,
      }
    }
    grouped[repoName].prs.push(pr)
    grouped[repoName].mergedCount++
  }

  const sorted = Object.entries(grouped).sort((a, b) => b[1].mergedCount - a[1].mergedCount)
  return Object.fromEntries(sorted)
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
`

function fetchContributions(octokit: Octokit, username: string): Effect.Effect<ContributionsResponse, E.GitHubError> {
  return Effect.gen(function*() {
    const response: GitHubContributionsResponse = yield* Effect.tryPromise({
      try: () => octokit.graphql(CONTRIBUTIONS_QUERY, { username }) as Promise<GitHubContributionsResponse>,
      catch: (e) => new E.GitHubError({ message: String(e) }),
    })

    const calendar = response.user.contributionsCollection.contributionCalendar

    let longestStreak = 0
    let currentStreak = 0
    const allDays: ContributionDay[] = []
    for (const week of calendar.weeks) {
      for (const day of week.contributionDays) {
        allDays.push(day)
      }
    }
    for (const day of allDays) {
      if (day.contributionCount > 0) {
        currentStreak++
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }

    return {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks,
      longestStreak,
    }
  })
}

type ContributionsResponse = {
  totalContributions: number
  weeks: GitHubContributionsResponse["user"]["contributionsCollection"]["contributionCalendar"]["weeks"]
  longestStreak: number
}

const USERNAME = "elianiva"
const MIN_STARS = 5000

export class GitHub extends Context.Service<GitHub, {
  readonly getPRs: () => Effect.Effect<{ grouped: GroupedPRs; totalPRs: number }>
  readonly getContributions: () => Effect.Effect<ContributionsResponse | null>
}>()("GitHub") {
  static readonly layer = Layer.effect(
    GitHub,
    Effect.gen(function*() {
      const token = Redacted.value(yield* Config.redacted("GH_TOKEN").pipe(Config.withDefault(Redacted.make(""))))
      const cache = yield* KvCache
      const octokit = new Octokit({ auth: token || undefined })

      const getPRs = Effect.fn("GitHub.getPRs")(function*() {
        if (!token) return { grouped: {}, totalPRs: 0 }
        const result = yield* cache.getOrSet("github-prs", Duration.hours(6),
          Effect.gen(function*() {
            const prs = yield* fetchAllPRs(octokit, USERNAME, MIN_STARS)
            return { grouped: groupPRs(prs), totalPRs: prs.length }
          }).pipe(
            Effect.catchTag("GitHubError", () => Effect.succeed({ grouped: {}, totalPRs: 0 })),
          ),
        ).pipe(
          Effect.catchTag("KvCacheError", () => Effect.succeed({ grouped: {}, totalPRs: 0 })),
        )
        return result
      })

      const getContributions = Effect.fn("GitHub.getContributions")(function*() {
        if (!token) return null
        const result = yield* cache.getOrSet("github-contributions", Duration.hours(6),
          Effect.gen(function*() {
            const result = yield* fetchContributions(octokit, USERNAME)
            return result
          }).pipe(
            Effect.catchTag("GitHubError", () => Effect.succeed(null)),
          ),
        ).pipe(
          Effect.catchTag("KvCacheError", () => Effect.succeed(null)),
        )
        return result
      })

      return { getPRs, getContributions }
    }),
  )
}
