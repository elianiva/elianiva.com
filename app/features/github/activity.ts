import { Schema } from "effect";
import { profile } from "../../data/profile";

/** My latest public activity on GitHub, read from its public events API. */
export const GitHubActivity = Schema.Struct({
  push: Schema.NullOr(
    Schema.Struct({
      repo: Schema.String,
      at: Schema.String,
      message: Schema.NullOr(Schema.String),
    }),
  ),
  release: Schema.NullOr(
    Schema.Struct({ repo: Schema.String, tag: Schema.String, at: Schema.String }),
  ),
  starred: Schema.NullOr(Schema.Struct({ repo: Schema.String, at: Schema.String })),
  pr: Schema.NullOr(
    Schema.Struct({
      repo: Schema.String,
      number: Schema.Number,
      title: Schema.String,
      at: Schema.String,
      merged: Schema.Boolean,
    }),
  ),
  /** Repos I pushed to in the last week, busiest first. */
  recent: Schema.Array(Schema.Struct({ repo: Schema.String, commits: Schema.Number })),
});
export type GitHubActivity = typeof GitHubActivity.Type;

export const emptyActivity: GitHubActivity = {
  push: null,
  release: null,
  starred: null,
  pr: null,
  recent: [],
};

export const activityUrl = `https://api.github.com/users/${profile.handle}/events/public?per_page=100`;

const WEEK = 7 * 24 * 3_600_000;

type GitHubEvent = {
  type: string;
  repo: { name: string };
  created_at: string;
  payload: {
    commits?: { message: string }[];
    size?: number;
    ref_type?: string;
    ref?: string;
    release?: { tag_name: string };
    action?: string;
    pull_request?: { number: number; title: string; merged?: boolean };
  };
};

/** Picks the rows the status board shows out of the public events. */
export function parseActivity(body: unknown, now: number = Date.now()): GitHubActivity {
  if (!Array.isArray(body)) return emptyActivity;
  const events = body as GitHubEvent[];
  const push = events.find((e) => e.type === "PushEvent");
  const release = events.find(
    (e) => e.type === "ReleaseEvent" || (e.type === "CreateEvent" && e.payload.ref_type === "tag"),
  );
  const starred = events.find((e) => e.type === "WatchEvent");
  // A pull request I opened or got merged in someone else's repo.
  const pr = events.find(
    (e) =>
      e.type === "PullRequestEvent" &&
      !e.repo.name.startsWith(`${profile.handle}/`) &&
      (e.payload.action === "opened" || e.payload.pull_request?.merged),
  );
  const since = now - WEEK;
  const counts = new Map<string, number>();
  for (const e of events) {
    if (e.type !== "PushEvent" || Date.parse(e.created_at) < since) continue;
    const n = e.payload.size ?? e.payload.commits?.length ?? 1;
    counts.set(e.repo.name, (counts.get(e.repo.name) ?? 0) + n);
  }
  const recent = [...counts]
    .map(([repo, commits]) => ({ repo, commits }))
    .sort((x, y) => y.commits - x.commits);
  return {
    recent,
    starred: starred ? { repo: starred.repo.name, at: starred.created_at } : null,
    pr: pr?.payload.pull_request
      ? {
          repo: pr.repo.name,
          number: pr.payload.pull_request.number,
          title: pr.payload.pull_request.title,
          at: pr.created_at,
          merged: Boolean(pr.payload.pull_request.merged),
        }
      : null,
    push: push
      ? {
          repo: push.repo.name,
          at: push.created_at,
          message: push.payload.commits?.at(-1)?.message.split("\n")[0] ?? null,
        }
      : null,
    release: release
      ? {
          repo: release.repo.name,
          tag: release.payload.release?.tag_name ?? release.payload.ref ?? "",
          at: release.created_at,
        }
      : null,
  };
}
