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

/** What I am likely up to at a given hour, and the colour of the dot that says so. */
const STATES: [until: number, text: string, dot: string][] = [
  [2, "winding down for the night", "bg-neutral-400"],
  [6, "asleep, I'll reply when I'm up", "bg-neutral-400"],
  [9, "morning coffee o'clock", "bg-amber-400"],
  [17, "probably at my desk", "bg-green-500"],
  [22, "winding down, replies are likely", "bg-green-500"],
  [24, "late-night coding, replies might be slow", "bg-amber-400"],
];
const stateFor = (h: number) => STATES.find(([until]) => h < until) ?? STATES[STATES.length - 1];

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
  const hour = now ? hourIn(profile.timeZone, now) : null;
  const state = hour === null ? null : stateFor(hour);

  return (
    <>
      {state && hour !== null && (
        <span className="relative mr-2 inline-flex size-2 align-middle">
          {isWorking(hour) && (
            <span
              className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none ${state[2]}`}
            />
          )}
          <span className={`relative inline-flex size-2 rounded-full ${state[2]}`} />
        </span>
      )}
      {profile.location} · {utcOffsetLabel(profile.timeZone)} — <LocalClock className={MONO} /> here
      {state ? `, ${state[1]}.` : "."}
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
