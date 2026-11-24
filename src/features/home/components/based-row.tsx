import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { profile, utcOffsetLabel } from "~/data/profile";
import { Cell } from "~/components/box";
import { cn } from "~/lib/utils";
import { useLocalTime } from "./local-clock";
import { currentRoles } from "~/data/work-experience";
import { getPosts } from "~/features/posts/lib/posts";
import { getRecentTracks } from "~/features/music/lib/music-server";

const INLINE_LINK =
  "text-pink-800 underline decoration-pink-300 decoration-dotted underline-offset-4 transition-colors hover:text-pink-600 hover:decoration-solid";

function hourIn(timeZone: string, date: Date): number {
  const part = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hour12: false })
    .formatToParts(date)
    .find((p) => p.type === "hour");
  return Number(part?.value ?? 0) % 24;
}

/**
 * A stretch of my day: the hour it ends at (exclusive), the colour of the dot
 * that says so, and the ways I put it into words. Add or reword a line and the
 * sentence follows; the rotation below needs no other change.
 */
interface Stretch {
  until: number;
  dot: string;
  lines: readonly string[];
}

const STATES: readonly Stretch[] = [
  {
    until: 2,
    dot: "bg-neutral-400",
    lines: [
      "winding down for the night",
      "calling it a night soon",
      "off the keyboard in a bit",
      "should be asleep already, honestly",
    ],
  },
  {
    until: 6,
    dot: "bg-neutral-400",
    lines: [
      "asleep, I'll reply when I'm up",
      "in bed, replies wait until morning",
      "fast asleep, I'll get back to you tomorrow",
      "out cold, replies resume with my coffee",
    ],
  },
  {
    until: 9,
    dot: "bg-amber-400",
    lines: [
      "morning coffee o'clock",
      "coffee first, words later",
      "easing into the day with a coffee",
      "shaking off sleep, mug in hand",
    ],
  },
  {
    until: 17,
    dot: "bg-green-500",
    lines: [
      "probably at my desk",
      "heads down at work, replies come quick",
      "at my desk, between meetings",
      "deep in a ticket somewhere",
    ],
  },
  {
    until: 22,
    dot: "bg-green-500",
    lines: [
      "winding down, replies are likely",
      "wrapping up loose ends from today",
      "off the clock, but still around",
      "evening tinkering, replies are likely",
    ],
  },
  {
    until: 24,
    dot: "bg-amber-400",
    lines: [
      "late-night coding, replies might be slow",
      "up late tinkering, replies might lag",
      "one more commit, I promise",
      "down a rabbit hole, replies might be slow",
    ],
  },
];
const stateFor = (h: number) => STATES.find((s) => h < s.until) ?? STATES[STATES.length - 1]!;

/** Hours since the epoch: the rotation's clock, and blind to time zones. */
const hourIndex = (now: Date) => Math.floor(now.getTime() / 3_600_000);

/**
 * One of the stretch's lines, mixed from the hour so it holds still while you
 * read and turns over as my day does. It never changes mid-tick, and everyone
 * reading at once sees the same line.
 */
function pickLine(lines: readonly string[], index: number): string {
  let seed = index | 0;
  seed = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  seed ^= seed >>> 13;
  return lines[(seed >>> 0) % lines.length]!;
}

/** My hour, the dot's colour, and the line to print. Null before I'm mounted. */
function currently(now: Date | null): { hour: number; dot: string; line: string } | null {
  if (!now) return null;
  const hour = hourIn(profile.timeZone, now);
  const stretch = stateFor(hour);
  return { hour, dot: stretch.dot, line: pickLine(stretch.lines, hourIndex(now)) };
}

/**
 * The visitor's hour offset from mine, read from their browser. Null until
 * mounted: the prerendered HTML cannot know who is reading it.
 */
function useVisitorOffset(now: Date | null): number | null {
  if (!now) return null;
  let diff =
    hourIn(Intl.DateTimeFormat().resolvedOptions().timeZone, now) - hourIn(profile.timeZone, now);
  if (diff > 12) diff -= 24;
  if (diff < -12) diff += 24;
  return diff;
}

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
};

/**
 * My latest public push and release, read from GitHub's public events.
 * Unauthenticated, so a rate limit just hides the rows that need it.
 */
async function fetchActivity(): Promise<GitHubActivity> {
  const res = await fetch(
    `https://api.github.com/users/${profile.handle}/events/public?per_page=100`,
  );
  if (!res.ok) return { push: null, release: null };
  const events = (await res.json()) as {
    type: string;
    repo: { name: string };
    created_at: string;
    payload: {
      commits?: { message: string }[];
      ref_type?: string;
      ref?: string;
      release?: { tag_name: string };
    };
  }[];
  const push = events.find((e) => e.type === "PushEvent");
  const release = events.find(
    (e) => e.type === "ReleaseEvent" || (e.type === "CreateEvent" && e.payload.ref_type === "tag"),
  );
  return {
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

const visitorTime = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * Text on split-flap tiles, one per character. A tile is keyed by its
 * character, so when the minute changes only the digits that changed flip.
 */
function Flaps({ text, dim = false }: { text: string; dim?: boolean }) {
  return (
    <span className="flex gap-[0.06em]" suppressHydrationWarning>
      {text.split("").map((ch, i) =>
        ch === ":" || ch === " " ? (
          <span key={i} className="w-[0.3em] self-center text-center text-pink-300/70">
            {ch}
          </span>
        ) : (
          <span
            key={`${i}-${ch}`}
            className={cn(
              "relative grid w-[0.7em] animate-flap place-items-center rounded-[0.08em] bg-pink-950 leading-[1.25] after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-black/60",
              dim ? "text-pink-200/70" : "text-pink-50",
            )}
          >
            {ch}
          </span>
        ),
      )}
    </span>
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
 * What I'm up to, as an arrivals board: my clock on split-flap tiles, then
 * one row each for my job, my latest push and release on GitHub, my latest
 * post, and what I last played. The GitHub and last.fm rows fill in after
 * mount; when either is unreachable, its row stays out.
 */
export function StatusTile() {
  const now = useNow();
  const offset = useVisitorOffset(now);
  const state = currently(now);
  const mine = useLocalTime();
  const activity = useActivity(now !== null);
  const track = useQuery({
    queryKey: ["home", "now-playing"],
    queryFn: async () => (await getRecentTracks()).tracks[0] ?? null,
    staleTime: 2 * 60_000,
    retry: false,
    enabled: now !== null,
  }).data;
  const role = currentRoles()[0];
  const post = getPosts({ limit: 1 })[0];
  const ago = (at: string | number) => (now ? timeAgo(at, now) : undefined);

  return (
    <Cell
      tone="graph"
      n={2}
      label="Status"
      className="@container max-md:col-span-2 xl:col-[4/6] xl:row-[1]"
    >
      <div className="flex flex-1 flex-col gap-3 rounded-sm bg-pink-950/95 p-3 shadow-[inset_0_2px_0_rgb(0_0_0/0.35)] @xs:p-4">
        <div className="flex items-end justify-between gap-3">
          <span className="font-mono text-[min(10cqw,3rem)] font-semibold tabular-nums">
            <Flaps text={mine} />
          </span>
          <span className="pb-1 text-right font-mono text-[9px] tracking-[0.25em] text-pink-200/80 uppercase">
            {profile.location} · {utcOffsetLabel(profile.timeZone)}
            {now && offset !== null && (
              <span className="block text-pink-300/60">
                {offset === 0 ? "same as you" : `${visitorTime.format(now)} for you`}
              </span>
            )}
          </span>
        </div>
        <ul className="mt-auto">
          {state && (
            <BoardRow code="Now">
              <span className={cn("size-1.5 shrink-0 self-center rounded-full", state.dot)} />
              <span className="truncate text-pink-50">{state.line}</span>
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
          {post && (
            <BoardRow code="Wrote" when={ago(post.date)}>
              <Link to="/posts/$slug" params={{ slug: post.slug }} className={ROW_LINK}>
                {post.title}
              </Link>
            </BoardRow>
          )}
          {track && (
            <BoardRow
              code={track.nowPlaying ? "Playing" : "Played"}
              when={track.nowPlaying ? "now" : track.ts ? ago(track.ts) : undefined}
            >
              <Link to="/music" className={ROW_LINK}>
                {track.track}
              </Link>
              <span className="truncate text-pink-200/60">{track.artist}</span>
            </BoardRow>
          )}
        </ul>
      </div>
    </Cell>
  );
}
