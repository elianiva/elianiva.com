import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { profile } from "~/data/profile";
import { Cell } from "~/components/box";
import { cn } from "~/lib/utils";
import { currentRoles } from "~/data/work-experience";
import { getPosts } from "~/features/posts/lib/posts";
import { getProjects } from "~/features/projects/lib/projects";

const INLINE_LINK =
  "text-pink-800 underline decoration-pink-300 decoration-dotted underline-offset-4 transition-colors hover:text-pink-600 hover:decoration-solid";

/** `null` during prerender and the first client render, then ticks every 30s. */
function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function timeAgo(from: string | number, now: Date): string {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(from).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

type GitHubActivity = {
  push: { repo: string; at: string; message: string | null } | null;
  release: { repo: string; tag: string; at: string } | null;
  starred: { repo: string; at: string } | null;
  pr: { repo: string; number: number; title: string; at: string; merged: boolean } | null;
  /** Repos I pushed to in the last week, busiest first. */
  recent: { repo: string; commits: number }[];
};

const WEEK = 7 * 24 * 3_600_000;

/**
 * My latest public push and release, read from GitHub's public events.
 * Unauthenticated, so a rate limit just hides the rows that need it.
 */
async function fetchActivity(): Promise<GitHubActivity> {
  const res = await fetch(
    `https://api.github.com/users/${profile.handle}/events/public?per_page=100`,
  );
  if (!res.ok) return { push: null, release: null, starred: null, pr: null, recent: [] };
  const events = (await res.json()) as {
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
  }[];
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
  const since = Date.now() - WEEK;
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

function useActivity(enabled: boolean) {
  return useQuery({
    queryKey: ["home", "github-activity"],
    queryFn: fetchActivity,
    staleTime: 5 * 60_000,
    retry: false,
    enabled,
  }).data;
}

/** `#pushed repo 14h ago`, mounted only: GitHub's events API is unauthenticated, so a rate limit just hides it. */
export function LastPushTag() {
  const now = useNow();
  const lastPush = useActivity(now !== null)?.push;
  if (!now || !lastPush) return null;

  return (
    <p className="font-mono text-xs text-pink-950/70">
      <span className="text-pink-400">#pushed</span>{" "}
      <a
        href={`https://github.com/${lastPush.repo}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative z-10 ${INLINE_LINK}`}
      >
        {lastPush.repo.split("/").pop()}
      </a>{" "}
      {timeAgo(lastPush.at, now)}
    </p>
  );
}

const ROW_LABEL = "font-mono text-[9px] tracking-[0.25em] text-yellow-300 uppercase";
const ROW_LINK = "relative z-10 min-w-0 truncate text-pink-50 hover:text-yellow-200";
const ROW_TIME = "shrink-0 font-mono text-[10px] text-pink-300/70 tabular-nums";

/** One line of the board: a code on the left, what happened, and when. */
function BoardRow({ code, children, when }: { code: string; children: ReactNode; when?: string }) {
  return (
    <li className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-baseline gap-3 border-t border-dashed border-pink-300/20 py-1.5 transition-opacity duration-300 ease-out first:border-t-0 starting:opacity-0">
      <span className={ROW_LABEL}>{code}</span>
      <span className="flex min-w-0 items-baseline gap-2 text-sm">{children}</span>
      {when && <span className={ROW_TIME}>{when}</span>}
    </li>
  );
}

/**
 * What I'm up to, as a board: the repos I pushed to this week, then one row
 * each for my job, my latest push and release on GitHub, my latest post, and
 * what I last played. The GitHub and last.fm rows fill in after
 * mount; when either is unreachable, its row stays out.
 */
export function StatusTile() {
  const now = useNow();
  const activity = useActivity(now !== null);
  const role = currentRoles()[0];
  const post = getPosts({ limit: 1 })[0];
  const project = getProjects()[0];
  const ago = (at: string | number) => (now ? timeAgo(at, now) : undefined);

  return (
    <Cell tone="dusk" label="Status" className="@container col-span-2 xl:col-[4/6] xl:row-[1]">
      <div className="flex flex-1 flex-col gap-3">
        <ul className="mt-auto">
          {activity && activity.recent.length > 0 && (
            <BoardRow code="Recently" when="this week">
              <span className="flex min-w-0 flex-wrap gap-x-2">
                {activity.recent.slice(0, 3).map(({ repo, commits }) => (
                  <a
                    key={repo}
                    href={`https://github.com/${repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(ROW_LINK, "font-mono text-[13px]")}
                  >
                    {repo.split("/").pop()}
                    <span className="ml-1 text-pink-300/60">×{commits}</span>
                  </a>
                ))}
              </span>
            </BoardRow>
          )}
          {role && (
            <BoardRow code="Work" when={role.time}>
              <a
                href={role.website?.href}
                target="_blank"
                rel="noopener noreferrer"
                className={ROW_LINK}
              >
                {role.company}
              </a>
              <span className="truncate text-pink-200/60">{role.position}</span>
            </BoardRow>
          )}
          {activity?.push && (
            <BoardRow code="Pushed" when={ago(activity.push.at)}>
              <a
                href={`https://github.com/${activity.push.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(ROW_LINK, "shrink-0 font-mono text-[13px]")}
              >
                {activity.push.repo.split("/").pop()}
              </a>
              {activity.push.message && (
                <span className="truncate text-pink-200/60">{activity.push.message}</span>
              )}
            </BoardRow>
          )}
          {activity?.release && (
            <BoardRow code="Shipped" when={ago(activity.release.at)}>
              <a
                href={`https://github.com/${activity.release.repo}/releases/tag/${activity.release.tag}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(ROW_LINK, "font-mono text-[13px]")}
              >
                {activity.release.repo.split("/").pop()} {activity.release.tag}
              </a>
            </BoardRow>
          )}
          {activity?.pr && (
            <BoardRow code={activity.pr.merged ? "Merged" : "Opened"} when={ago(activity.pr.at)}>
              <a
                href={`https://github.com/${activity.pr.repo}/pull/${activity.pr.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(ROW_LINK, "shrink-0 font-mono text-[13px]")}
              >
                {activity.pr.repo.split("/").pop()}#{activity.pr.number}
              </a>
              <span className="truncate text-pink-200/60">{activity.pr.title}</span>
            </BoardRow>
          )}
          {project && (
            <BoardRow code="Built" when={ago(project.date)}>
              <Link
                to="/projects/$slug"
                params={{ slug: project.slug }}
                className={cn(ROW_LINK, "shrink-0")}
              >
                {project.title}
              </Link>
              <span className="truncate text-pink-200/60">{project.description}</span>
            </BoardRow>
          )}
          {post && (
            <BoardRow code="Wrote" when={ago(post.date)}>
              <Link to="/posts/$slug" params={{ slug: post.slug }} className={ROW_LINK}>
                {post.title}
              </Link>
            </BoardRow>
          )}
          {activity?.starred && (
            <BoardRow code="Starred" when={ago(activity.starred.at)}>
              <a
                href={`https://github.com/${activity.starred.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(ROW_LINK, "font-mono text-[13px]")}
              >
                {activity.starred.repo}
              </a>
            </BoardRow>
          )}
        </ul>
      </div>
    </Cell>
  );
}
