import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { profile, utcOffsetLabel } from "~/data/profile";
import { getRecentTracks } from "~/features/music/lib/music-server";
import { LocalClock } from "./local-clock";

const WORK_START = 9;
const WORK_END = 22;

const MONO = "font-mono text-pink-700";
const INLINE_LINK =
  "text-pink-800 underline decoration-pink-300 decoration-dotted underline-offset-4 transition-colors hover:text-pink-600 hover:decoration-solid";

const pad = (n: number) => String(n).padStart(2, "0");
const wrap = (h: number) => ((h % 24) + 24) % 24;
const isWorking = (h: number) => h >= WORK_START && h < WORK_END;

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

function Overlap({ offset }: { offset: number }) {
  if (offset === 0) return <>We&apos;re in the same timezone.</>;
  const dir = offset < 0 ? `${-offset}h behind` : `${offset}h ahead of`;
  return (
    <>
      You&apos;re {dir} me — my {pad(WORK_START)}:00–{pad(WORK_END)}:00 is{" "}
      <span className={MONO}>
        {pad(wrap(WORK_START + offset))}:00–{pad(wrap(WORK_END + offset))}:00
      </span>{" "}
      for you.
    </>
  );
}

function DayStrip({ hour, offset }: { hour: number; offset: number }) {
  return (
    <div className="mt-2 max-w-[32rem]">
      <div className="grid grid-cols-24 gap-0.5">
        {Array.from({ length: 24 }, (_, i) => {
          const tone = isWorking(i)
            ? "bg-pink-400"
            : i < 6 || i >= WORK_END
              ? "bg-pink-200/30"
              : "bg-pink-200";
          return (
            <div
              key={i}
              title={`${pad(i)}:00 → ${pad(wrap(i + offset))}:00 for you`}
              className={`h-3.5 ${tone} ${i === hour ? "outline-2 outline-offset-1 outline-pink-950" : ""}`}
            />
          );
        })}
      </div>
      <div
        className="mt-0.5 flex justify-between font-mono text-[11px] text-pink-950/50"
        aria-hidden
      >
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>24</span>
      </div>
    </div>
  );
}

function timeAgo(from: string | number, now: Date): string {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(from).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

type LastPush = { repo: string; at: string };

/** My most recent public push. Unauthenticated, so a rate limit just hides the tag. */
async function fetchLastPush(): Promise<LastPush | null> {
  const res = await fetch(
    `https://api.github.com/users/${profile.handle}/events/public?per_page=30`,
  );
  if (!res.ok) return null;
  const events = (await res.json()) as {
    type: string;
    repo: { name: string };
    created_at: string;
  }[];
  const push = events.find((e) => e.type === "PushEvent");
  return push ? { repo: push.repo.name, at: push.created_at } : null;
}

/** `#listening` / `#pushed` tags: mono hashtags and dotted links, no boxes. */
function Activity({ now }: { now: Date }) {
  const music = useQuery({
    queryKey: ["home", "now-playing"],
    queryFn: async () => (await getRecentTracks()).tracks[0] ?? null,
    staleTime: 2 * 60_000,
    retry: false,
  });
  const push = useQuery({
    queryKey: ["home", "last-push"],
    queryFn: fetchLastPush,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const track = music.data;
  const lastPush = push.data;
  if (!track && !lastPush) return null;

  return (
    <div className="mt-3 font-mono text-xs leading-[1.9] text-pink-950/70">
      {track && (
        <>
          <span className="text-pink-400">{track.nowPlaying ? "#listening" : "#played"}</span>{" "}
          <a href={track.url} target="_blank" rel="noopener noreferrer" className={INLINE_LINK}>
            {track.artist} — {track.track}
          </a>
          {!track.nowPlaying && track.ts && <> {timeAgo(track.ts, now)}</>}
        </>
      )}
      {track && lastPush && <span className="mx-2 text-pink-300">/</span>}
      {lastPush && (
        <>
          <span className="text-pink-400">#pushed</span>{" "}
          <a
            href={`https://github.com/${lastPush.repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className={INLINE_LINK}
          >
            {lastPush.repo.split("/").pop()}
          </a>{" "}
          {timeAgo(lastPush.at, now)}
        </>
      )}
    </div>
  );
}

/**
 * Where I am and what I'm up to. The prerendered HTML carries only the place
 * and the clock; once mounted, the sentence follows my local hour, the overlap
 * with the visitor's timezone appears, and the live tags load.
 */
export function BasedRow() {
  const now = useNow();
  const offset = useVisitorOffset(now);
  const state = currently(now);
  const hour = state?.hour ?? null;

  return (
    <>
      {state && hour !== null && (
        <span className="relative mr-2 inline-flex size-2 align-middle">
          {isWorking(hour) && (
            <span
              className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none ${state.dot}`}
            />
          )}
          <span className={`relative inline-flex size-2 rounded-full ${state.dot}`} />
        </span>
      )}
      {profile.location} · {utcOffsetLabel(profile.timeZone)} — <LocalClock className={MONO} /> here
      {state ? `, ${state.line}.` : "."}
      {offset !== null && hour !== null && (
        <>
          {" "}
          <Overlap offset={offset} />
          <DayStrip hour={hour} offset={offset} />
        </>
      )}
      {now && <Activity now={now} />}
    </>
  );
}
