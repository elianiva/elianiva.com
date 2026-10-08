import { describe, expect, it } from "vite-plus/test";
import { Effect } from "effect";
import { decodeContributions, decodePRs } from "./github.service";

/**
 * The `github-contributions` production failure: when the GitHub API answers
 * with a malformed shape (error payload, partial data), direct field access
 * throws a synchronous `TypeError` — an Effect defect, not a failure — which
 * used to skip the `KvCache` fallback, escape the server function, and
 * surface in the browser as `["github-contributions"] data is undefined`.
 * Malformed shapes must fail through the error channel instead, so the
 * cache degrades to its fallback.
 */
describe("GitHub response decoders", () => {
  it("decodeContributions rejects a null user", async () => {
    const result = await Effect.runPromise(
      decodeContributions({ user: null } as never).pipe(Effect.flip),
    );
    expect(result.message).toContain("unexpected GitHub contributions shape");
  });

  it("decodeContributions rejects a missing calendar", async () => {
    const result = await Effect.runPromise(
      decodeContributions({ user: { contributionsCollection: {} } } as never).pipe(Effect.flip),
    );
    expect(result.message).toContain("unexpected GitHub contributions shape");
  });

  it("decodeContributions accepts a well-formed calendar", async () => {
    const result = await Effect.runPromise(
      decodeContributions({
        user: {
          contributionsCollection: {
            contributionCalendar: {
              totalContributions: 10,
              weeks: [
                {
                  contributionDays: [
                    {
                      date: "2026-10-01",
                      contributionCount: 3,
                      contributionLevel: "FIRST_QUARTILE",
                    },
                    { date: "2026-10-02", contributionCount: 0, contributionLevel: "NONE" },
                    {
                      date: "2026-10-03",
                      contributionCount: 2,
                      contributionLevel: "FIRST_QUARTILE",
                    },
                  ],
                },
              ],
            },
          },
        },
      }),
    );
    expect(result.totalContributions).toBe(10);
    expect(result.longestStreak).toBe(1);
  });

  it("decodePRs rejects a null user", async () => {
    const result = await Effect.runPromise(decodePRs({ user: null } as never).pipe(Effect.flip));
    expect(result.message).toContain("unexpected GitHub PR contributions shape");
  });

  it("decodePRs skips malformed entries instead of throwing", async () => {
    const result = await Effect.runPromise(
      decodePRs({
        user: {
          contributionsCollection: {
            pullRequestContributionsByRepository: [
              null,
              { repository: null, contributions: null },
              {
                repository: {
                  name: "foldkit",
                  nameWithOwner: "foldkit/foldkit",
                  url: "https://github.com/foldkit/foldkit",
                  stargazerCount: 920,
                },
                contributions: { nodes: [null, { pullRequest: null }] },
              },
            ],
          },
        },
      } as never),
    );
    expect(result).toEqual([]);
  });
});
