import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { ENDED, PLAYING, loadYouTube, type YouTubePlayer } from "./youtube";

/** One note: when it reaches the line (ms from the start of the video), its lane, and a hold's length. */
export interface Note {
  t: number;
  lane: number;
  len?: number;
}

export interface Chart {
  title: string;
  artist: string;
  videoId: string;
  bpm: number;
  offsetMs: number;
  durationMs: number;
  notes: Note[];
}

const KEYS = ["d", "f", "j", "k"];
const LANE_TONES = ["bg-sky-400", "bg-pink-400", "bg-pink-400", "bg-sky-400"];
const HOLD_TONES = ["bg-sky-300/70", "bg-pink-300/70", "bg-pink-300/70", "bg-sky-300/70"];
/** How long the stage counts down before the video starts. */
const LEAD = 1500;
const NOTE_H = 12;
const OFFSET_KEY = "encore-offset";

/** Project Sekai's timing windows, in ms either side of the note. GOOD or worse breaks the combo. */
const JUDGEMENTS = [
  { within: 41.7, label: "Perfect", tone: "text-pink-500", weight: 1, keepsCombo: true },
  { within: 83.3, label: "Great", tone: "text-sky-500", weight: 0.7, keepsCombo: true },
  { within: 108.3, label: "Good", tone: "text-green-600", weight: 0.5, keepsCombo: false },
  { within: 125, label: "Bad", tone: "text-purple-500", weight: 0, keepsCombo: false },
] as const;
const PERFECT = JUDGEMENTS[0];
const MISS = { label: "Miss", tone: "text-pink-950/40", weight: 0, keepsCombo: false } as const;
const WINDOW = 125;
type Judgement = (typeof JUDGEMENTS)[number] | typeof MISS;

type Phase = "idle" | "loading" | "play" | "done";
type Hit = { n: number; label: string; tone: string };

/** A tap counts once; a hold counts its head and its tail. */
const weightOf = (notes: Note[]) => notes.reduce((sum, n) => sum + (n.len ? 2 : 1), 0);

/**
 * A four-lane rhythm game in the osu!mania style, played to a YouTube video
 * on D F J K, or by tapping the lanes. Notes fall to the line; holds must be
 * held until their tail passes it. Nothing loads until you press Play: the
 * chart is imported then, and the video plays through YouTube's own player.
 */
export function RhythmGame({ full = false }: { full?: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [chart, setChart] = useState<Chart | null>(null);
  const [hit, setHit] = useState<Hit | null>(null);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [tally, setTally] = useState<Record<string, number>>({});
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stage = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const lanes = useRef<(HTMLDivElement | null)[]>([]);
  const noteEls = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setOffset(Number(localStorage.getItem(OFFSET_KEY)) || 0);
  }, []);

  function nudge(by: number) {
    setOffset((o) => {
      const next = Math.max(-200, Math.min(200, o + by));
      localStorage.setItem(OFFSET_KEY, String(next));
      return next;
    });
  }

  async function play() {
    setError(null);
    setHit(null);
    setCombo(0);
    setBest(0);
    setTally({});
    setPhase("loading");
    try {
      const [mod] = await Promise.all([import("./chart.json"), loadYouTube()]);
      setChart(mod.default as Chart);
      setPhase("play");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPhase("idle");
    }
  }

  useEffect(() => {
    if (phase !== "play" || !chart || !stage.current || !host.current || !window.YT) return;
    const notes = chart.notes;
    const judged = notes.map(() => false);
    const holding: (number | null)[] = [null, null, null, null];
    const scroll = full ? 1200 : 950;
    let comboNow = 0;
    let hitCount = 0;
    let cursor = 0;

    function record(j: Judgement) {
      comboNow = j.keepsCombo ? comboNow + 1 : 0;
      const c = comboNow;
      hitCount += 1;
      const n = hitCount;
      setHit({ n, label: j.label, tone: j.tone });
      setCombo(c);
      setBest((b) => Math.max(b, c));
      setTally((t) => ({ ...t, [j.label]: (t[j.label] ?? 0) + 1 }));
    }
    const hide = (i: number) => noteEls.current[i]?.style.setProperty("visibility", "hidden");

    // The player lives in a node React does not manage, so YouTube can replace it.
    const mount = document.createElement("div");
    host.current.replaceChildren(mount);
    let ready = false;
    const player: YouTubePlayer = new window.YT.Player(mount, {
      videoId: chart.videoId,
      width: full ? 192 : 112,
      height: full ? 108 : 63,
      playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0, iv_load_policy: 3 },
      events: {
        onReady: () => {
          ready = true;
        },
        onStateChange: (event) => {
          if (event.data === ENDED) setPhase("done");
        },
        onError: (event) => {
          // 101 and 150: the uploader does not allow embedding.
          setError(
            event.data === 101 || event.data === 150
              ? "This video does not allow playing outside YouTube"
              : `YouTube could not play the video (error ${event.data})`,
          );
          setPhase("idle");
        },
      },
    });

    // Song time: anchored to the player's clock, advanced between its coarse updates.
    const started = performance.now();
    let anchor: { yt: number; at: number } | null = null;
    let requested = false;
    function songTime(): number {
      const nowPerf = performance.now();
      const lead = nowPerf - started - LEAD;
      if (lead < 0) return lead - offset;
      if (!ready) return -offset;
      if (!requested) {
        requested = true;
        player.seekTo(0, true);
        player.playVideo();
      }
      const playing = player.getPlayerState() === PLAYING;
      const yt = player.getCurrentTime() * 1000;
      if (!playing) {
        anchor = null;
        return yt - offset;
      }
      if (!anchor || Math.abs(anchor.yt + (nowPerf - anchor.at) - yt) > 40) {
        anchor = { yt, at: nowPerf };
      }
      return anchor.yt + (nowPerf - anchor.at) - offset;
    }

    function press(lane: number) {
      lanes.current[lane]?.setAttribute("data-down", "");
      const t = songTime();
      let pick = -1;
      for (let i = cursor; i < notes.length && notes[i]!.t <= t + WINDOW; i++) {
        const note = notes[i]!;
        if (note.lane === lane && !judged[i] && Math.abs(t - note.t) <= WINDOW) {
          pick = i;
          break;
        }
      }
      // A press with no note near it does nothing.
      if (pick < 0) return;
      judged[pick] = true;
      const off = Math.abs(t - notes[pick]!.t);
      record(JUDGEMENTS.find((j) => off <= j.within) ?? MISS);
      if (notes[pick]!.len) holding[lane] = pick;
      else hide(pick);
    }

    function release(lane: number) {
      lanes.current[lane]?.removeAttribute("data-down");
      const i = holding[lane];
      if (i === null || i === undefined) return;
      holding[lane] = null;
      const end = notes[i]!.t + notes[i]!.len!;
      record(songTime() >= end - WINDOW ? PERFECT : MISS);
      hide(i);
    }

    let frame = 0;
    function tick() {
      const t = songTime();
      const height = stage.current?.clientHeight ?? 0;
      const line = height - 40;
      const px = line / scroll;

      for (let lane = 0; lane < 4; lane++) {
        const i = holding[lane];
        if (i !== null && i !== undefined && t >= notes[i]!.t + notes[i]!.len!) {
          holding[lane] = null;
          record(PERFECT);
          hide(i);
        }
      }
      while (cursor < notes.length) {
        const note = notes[cursor]!;
        const done = judged[cursor] && holding[note.lane] !== cursor;
        if (done && t > note.t + (note.len ?? 0) + WINDOW) cursor++;
        else if (!judged[cursor] && t > note.t + WINDOW) {
          judged[cursor] = true;
          record(MISS);
          if (note.len) record(MISS);
          hide(cursor);
          cursor++;
        } else break;
      }
      for (let i = cursor; i < notes.length && notes[i]!.t < t + scroll; i++) {
        const note = notes[i]!;
        const el = noteEls.current[i];
        if (!el) continue;
        const held = holding[note.lane] === i;
        if (judged[i] && !held) continue;
        // While held, the head stays on the line and the body shortens.
        const head = held ? t : note.t;
        const tail = note.t + (note.len ?? 0);
        const h = (tail - head) * px + NOTE_H;
        const y = line - (head - t) * px - h + NOTE_H / 2;
        el.style.height = `${h}px`;
        el.style.transform = `translateY(${y}px)`;
        el.style.visibility = "visible";
      }
      if (t > chart!.durationMs) setPhase("done");
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") return setPhase("idle");
      const lane = KEYS.indexOf(event.key.toLowerCase());
      if (lane < 0 || event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      if (event.type === "keyup") release(lane);
      else if (!event.repeat) press(lane);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    const pointer = lanes.current.map((el, lane) => {
      const down = (event: PointerEvent) => {
        event.preventDefault();
        press(lane);
      };
      const up = () => release(lane);
      el?.addEventListener("pointerdown", down);
      el?.addEventListener("pointerup", up);
      el?.addEventListener("pointerleave", up);
      el?.addEventListener("pointercancel", up);
      return () => {
        el?.removeEventListener("pointerdown", down);
        el?.removeEventListener("pointerup", up);
        el?.removeEventListener("pointerleave", up);
        el?.removeEventListener("pointercancel", up);
      };
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      pointer.forEach((off) => off());
      player.destroy();
      noteEls.current.forEach((el) => el?.style.setProperty("visibility", "hidden"));
      lanes.current.forEach((el) => el?.removeAttribute("data-down"));
    };
  }, [phase, chart, full, offset]);

  const total = chart ? weightOf(chart.notes) : 0;
  const score = JUDGEMENTS.reduce((sum, j) => sum + (tally[j.label] ?? 0) * j.weight, 0);
  const accuracy = total ? (score / total) * 100 : 0;
  const misses = (tally.Bad ?? 0) + (tally.Good ?? 0) + (tally.Miss ?? 0);
  const rank =
    tally.Perfect === total
      ? "All perfect"
      : misses === 0
        ? "Full combo"
        : accuracy >= 60
          ? "Clear"
          : "Failed";

  const button =
    "border-2 border-pink-950 bg-yellow-300 px-4 py-2 font-display text-base font-extrabold tracking-[0.15em] text-pink-950 uppercase shadow-[3px_3px_0_rgb(80_7_36)] transition-[translate,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[3px_5px_0_rgb(80_7_36)] active:translate-y-0.5 active:shadow-[1px_1px_0_rgb(80_7_36)]";
  const small =
    "border border-pink-300 bg-white px-3 py-1.5 font-mono text-[11px] tracking-wider text-pink-700 uppercase transition-[background-color,scale] hover:bg-pink-50 active:scale-[0.97]";

  return (
    <div className={cn("flex flex-col gap-3", full && "flex-1")}>
      {(phase === "idle" || phase === "loading") && (
        <div className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-3">
          <button type="button" onClick={play} disabled={phase === "loading"} className={button}>
            <span aria-hidden>▶</span> {phase === "loading" ? "Loading" : "Play"}
          </button>
          <div className="flex flex-col gap-1 font-mono text-[10px] tracking-wider text-pink-950/55 uppercase">
            <span>D F J K or tap the lanes · Esc to stop</span>
            <span className="flex items-center gap-1.5">
              offset
              <button type="button" onClick={() => nudge(-10)} className="px-1 text-pink-600">
                −
              </button>
              <span className="w-12 text-center text-pink-950 tabular-nums">
                {offset > 0 ? "+" : ""}
                {offset}ms
              </span>
              <button type="button" onClick={() => nudge(10)} className="px-1 text-pink-600">
                +
              </button>
            </span>
            {best > 0 && <span>best combo {best}</span>}
            {error && <span className="text-pink-600 normal-case">{error}</span>}
          </div>
          {!full && (
            <Link to="/encore" className={cn(small, "relative z-10 ml-auto")}>
              Open in full ↗
            </Link>
          )}
        </div>
      )}

      {phase === "play" && chart && (
        <div className={cn("flex items-stretch gap-3", full && "flex-1")}>
          <div
            ref={stage}
            className={cn(
              "relative grid min-w-0 flex-1 touch-none grid-cols-4 overflow-hidden border border-pink-200 bg-white/85 select-none",
              full ? "h-[min(70vh,44rem)]" : "h-56",
            )}
          >
            {KEYS.map((key, lane) => (
              <div
                key={key}
                ref={(el) => {
                  lanes.current[lane] = el;
                }}
                className="relative border-r border-dashed border-pink-100 last:border-r-0 data-[down]:bg-pink-50"
              >
                <span className="absolute inset-x-0 bottom-2 text-center font-mono text-[10px] text-pink-950/40 uppercase">
                  {key}
                </span>
              </div>
            ))}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 h-1 bg-pink-500 shadow-[0_0_10px_rgb(236_72_153/0.6)]"
              style={{ bottom: 38 }}
            />
            {chart.notes.map((note, i) => (
              <div
                key={i}
                ref={(el) => {
                  noteEls.current[i] = el;
                }}
                aria-hidden
                className={cn(
                  "pointer-events-none invisible absolute top-0 rounded-sm border-2 border-white",
                  note.len ? HOLD_TONES[note.lane] : LANE_TONES[note.lane],
                )}
                style={{ left: `calc(${note.lane * 25}% + 4px)`, width: "calc(25% - 8px)" }}
              >
                {note.len && (
                  <span
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-2.5 rounded-sm",
                      LANE_TONES[note.lane],
                    )}
                  />
                )}
              </div>
            ))}
            <span
              aria-live="polite"
              className="pointer-events-none absolute inset-x-0 top-1/3 grid place-items-center"
            >
              {hit && (
                <span
                  key={hit.n}
                  className={`animate-judge rounded-sm bg-white/90 px-2 font-display text-xl font-extrabold tracking-[0.15em] uppercase italic ${hit.tone}`}
                >
                  {hit.label}
                </span>
              )}
            </span>
          </div>
          <div className="flex w-28 shrink-0 flex-col gap-2 sm:w-auto">
            <div ref={host} className="overflow-hidden border border-pink-200 bg-pink-950" />
            <div className="flex flex-1 flex-col items-center justify-center border border-pink-200 bg-white/80 py-2">
              <span className="font-mono text-[8px] tracking-[0.25em] text-pink-950/50 uppercase">
                Combo
              </span>
              <span
                key={combo}
                className="animate-judge font-display text-3xl leading-none font-extrabold text-pink-600 tabular-nums"
              >
                {combo}
              </span>
            </div>
            <button type="button" onClick={() => setPhase("idle")} className={small}>
              Stop
            </button>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-3">
          <p className="animate-judge -rotate-3 font-display text-2xl font-extrabold tracking-[0.12em] text-pink-600 uppercase italic">
            {rank}
          </p>
          <dl className="grid grid-cols-5 gap-x-3 font-mono text-[10px] uppercase">
            {[...JUDGEMENTS, MISS].map((j) => (
              <div key={j.label} className="flex flex-col">
                <dt className={j.tone}>{j.label}</dt>
                <dd className="text-base text-pink-950 tabular-nums">{tally[j.label] ?? 0}</dd>
              </div>
            ))}
          </dl>
          <p className="font-mono text-[10px] text-pink-950/55 uppercase">
            {accuracy.toFixed(1)}% · max combo {best}
          </p>
          <button type="button" onClick={play} className={cn(small, "ml-auto")}>
            Again
          </button>
        </div>
      )}

      {chart && (
        <p className="font-mono text-[10px] text-pink-950/45">
          ♪{" "}
          <a
            href={`https://www.youtube.com/watch?v=${chart.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 underline decoration-dotted underline-offset-2 hover:text-pink-600"
          >
            {chart.title} · {chart.artist}
          </a>{" "}
          · {Math.round(chart.bpm)} bpm · {chart.notes.length} notes
        </p>
      )}
    </div>
  );
}
