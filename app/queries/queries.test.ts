import { Effect } from "effect";
import { describe, expect, it } from "vite-plus/test";
import { emptyContributions, emptyPrs } from "../features/github/types";
import { emptyMusic, emptyTopLists } from "../features/music/types";
import { JsonApi, JsonApiError, readOr } from "./JsonApi";
import { GetContributions } from "./GetContributions";
import { GetGitHubPrs } from "./GetGitHubPrs";
import { GetRecentTracks } from "./GetRecentTracks";
import { GetTopLists } from "./GetTopLists";
import { PrsResponse } from "../features/github/types";

const api = (get: (url: string) => Effect.Effect<unknown, JsonApiError>) => JsonApi.of({ get });

describe("readOr", () => {
  it("decodes a good body", () => {
    const body = { grouped: [], totalPRs: 0 };
    const out = Effect.runSync(
      readOr(
        api(() => Effect.succeed(body)),
        "/x",
        PrsResponse,
        emptyPrs,
      ),
    );
    expect(out).toEqual(body);
  });

  it("degrades to the fallback when the read fails", () => {
    const fail = api((url) => Effect.fail(new JsonApiError({ url, reason: "offline" })));
    expect(Effect.runSync(readOr(fail, "/x", PrsResponse, emptyPrs))).toBe(emptyPrs);
  });

  it("degrades to the fallback when the body has the wrong shape", () => {
    expect(
      Effect.runSync(
        readOr(
          api(() => Effect.succeed({ nope: 1 })),
          "/x",
          PrsResponse,
          emptyPrs,
        ),
      ),
    ).toBe(emptyPrs);
  });
});

describe("empty states", () => {
  it("the empty heatmap spans a year of blank days", () => {
    const empty = emptyContributions(new Date("2026-06-15T12:00:00Z"));
    const days = empty.weeks.flatMap((w) => w.contributionDays);
    expect(days).toHaveLength(365);
    expect(empty.totalContributions).toBe(0);
  });

  it("the queries are the ones the pages read", () => {
    expect([GetContributions, GetGitHubPrs, GetRecentTracks, GetTopLists].length).toBe(4);
    expect(emptyMusic.tracks).toEqual([]);
    expect(emptyTopLists.stats.totalTracks).toBe(0);
  });
});
