import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "~/lib/utils";
import { RhythmGame } from "~/features/encore/rhythm-game";
import { Box, Cell } from "./box";

function BuildDate() {
  const [value, setValue] = useState("");
  useEffect(() => {
    // oxlint-disable-next-line efx-no-native-date
    setValue(
      new Date().toLocaleString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }),
    );
  }, []);
  return (
    <span className="font-mono text-[10px] text-pink-950/45" suppressHydrationWarning>
      {value || "\u00a0"}
    </span>
  );
}

/** The minigame, small enough to sit in the footer; /encore plays it full size. */
function EncoreCell() {
  return (
    <Cell span="w2" tone="graph" label="Encore" className="md:col-span-2 xl:col-span-4">
      <RhythmGame />
    </Cell>
  );
}

/** Corrugated cardboard: fine flutes, a few darker fibres, and a soft grain. */
const CARDBOARD = [
  "repeating-linear-gradient(90deg, rgb(150 95 40 / 0.14) 0 1px, transparent 1px 5px)",
  "repeating-linear-gradient(90deg, transparent 0 23px, rgb(120 70 20 / 0.1) 23px 24px, transparent 24px 41px)",
  "radial-gradient(rgb(120 70 20 / 0.12) 0.6px, transparent 0.9px) 0 0 / 4px 4px",
].join(", ");

/**
 * The box's tenant: an original, very shy lilac blob that melts at the base,
 * with a guitar pick for a tuft. Its face follows the knocks: wide eyes at
 * first, a glance away, then squeezed shut with tears.
 */
function Tenant({ level }: { level: number }) {
  const flustered = level >= 3;
  return (
    <svg viewBox="0 0 80 96" className="block w-full overflow-visible">
      {/* body, melting into puddles at the base */}
      <g
        className={cn(
          "origin-bottom transition-transform duration-300 ease-out [transform-box:fill-box]",
          flustered && "scale-x-[1.06] scale-y-[0.94]",
        )}
      >
        <path
          d="M8 96 C4 92 6 84 10 80 C8 54 20 30 40 30 C60 30 72 54 70 80 C74 84 76 92 72 96 C68 92 64 94 60 96 C56 92 50 94 47 96 C43 92 37 92 33 96 C29 93 22 92 19 96 C15 93 12 94 8 96 Z"
          fill="#e9d5ff"
          stroke="#c084fc"
          strokeWidth="1.5"
        />
        <path
          d="M18 48 C22 40 28 36 33 35"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M14 84 C20 88 30 89 40 89"
          fill="none"
          stroke="#d8b4fe"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      {/* guitar-pick tuft */}
      <path
        d="M40 31 C34 22 34 12 40 8 C46 12 46 22 40 31 Z"
        fill="#facc15"
        stroke="#fff"
        strokeWidth="1.5"
      />
      {flustered ? (
        <g
          fill="none"
          stroke="#3b0764"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M25 51 L34 56 L25 61" />
          <path d="M55 51 L46 56 L55 61" />
          <path
            d="M27 64 Q25 69 27 71 Q29 69 27 64 Z"
            fill="#7dd3fc"
            stroke="#38bdf8"
            strokeWidth="0.8"
          />
          <path
            d="M53 64 Q51 69 53 71 Q55 69 53 64 Z"
            fill="#7dd3fc"
            stroke="#38bdf8"
            strokeWidth="0.8"
          />
        </g>
      ) : (
        <g
          className={cn(
            "transition-transform duration-200 ease-out",
            level === 2 && "translate-x-[4px]",
          )}
        >
          <ellipse cx="31" cy="56" rx="5" ry="6.5" fill="#3b0764" />
          <ellipse cx="49" cy="56" rx="5" ry="6.5" fill="#3b0764" />
          <circle cx="32.8" cy="53.6" r="1.8" fill="#fff" />
          <circle cx="50.8" cy="53.6" r="1.8" fill="#fff" />
        </g>
      )}
      {/* blush and a wobbly mouth */}
      <ellipse cx="22" cy="66" rx="4" ry="1.8" fill="#f472b6" opacity={flustered ? 0.6 : 0.3} />
      <ellipse cx="58" cy="66" rx="4" ry="1.8" fill="#f472b6" opacity={flustered ? 0.6 : 0.3} />
      <path
        d="M36 70 Q38 68.5 40 70 T44 70"
        fill="none"
        stroke="#6b21a8"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* sweat drop */}
      {level > 0 && !flustered && (
        <path
          d="M63 44 Q66 49 63 51 Q60 49 63 44 Z"
          fill="#bae6fd"
          stroke="#38bdf8"
          strokeWidth="0.6"
        />
      )}
    </svg>
  );
}

/** What it says, one line per knock. */
const TENANT_LINES = ["", "…", "o-oh. hi.", "i'm just a box, honestly"];
/** How far it sits below the box's rim, in px, for each knock. */
const TENANT_DEPTH = [100, 4, -16, -40];

/**
 * A cardboard box with someone shy in it. Hover and it lifts the lid to look
 * out. Each knock coaxes it a little further out; leave it alone for a
 * moment and it ducks back in.
 */
function ShyBox() {
  const [knocks, setKnocks] = useState(0);
  useEffect(() => {
    if (!knocks) return;
    const id = window.setTimeout(() => setKnocks(0), 2600);
    return () => window.clearTimeout(id);
  }, [knocks]);

  const level = Math.min(knocks, 3);

  return (
    <Cell label="Do not perceive" className="items-center justify-end">
      <button
        type="button"
        aria-label="Knock on the box"
        onClick={() => setKnocks((k) => k + 1)}
        style={{ "--d": `${TENANT_DEPTH[level]}px` } as CSSProperties}
        className="group/box relative mt-6 h-44 w-32 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink-500"
      >
        {level > 0 && (
          <span
            key={`line-${level}`}
            aria-live="polite"
            className="absolute -top-2 right-1/2 z-30 w-max max-w-36 translate-x-1/2 animate-judge rounded-md border border-pink-200 bg-white px-2 py-1 font-mono text-[10px] text-pink-950 shadow-[0_2px_0_rgb(244_114_182/0.35)]"
          >
            {TENANT_LINES[level]}
          </span>
        )}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-40 overflow-hidden">
          <span
            className={cn(
              "absolute bottom-0 left-1/2 block w-20 -translate-x-1/2 translate-y-(--d) transition-transform duration-300 ease-out",
              level === 0 && "group-hover/box:[--d:24px]",
            )}
          >
            <Tenant level={level} />
          </span>
        </span>
        <span
          key={`box-${knocks}`}
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0 z-10 h-14 border-2 border-[#b07a3c] bg-[#e2b47a] shadow-[inset_0_-6px_0_rgb(120_70_20/0.18)]",
            knocks > 0 && "animate-knock",
          )}
          style={{ backgroundImage: CARDBOARD }}
        >
          <span className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 bg-[#f3e2b8]/80 shadow-[inset_1px_0_0_rgb(255_255_255/0.5),inset_-1px_0_0_rgb(120_70_20/0.15)]" />
          <span className="absolute top-2 left-2 -rotate-6 border border-[#8a5a24]/60 px-1 font-mono text-[7px] leading-tight tracking-widest text-[#8a5a24]/80 uppercase">
            Fragile
          </span>
          <span className="absolute right-2 bottom-1.5 font-mono text-[9px] leading-none text-[#8a5a24]/70">
            ↑↑
          </span>
          <span className="absolute top-1/2 right-3 h-2 w-5 -translate-y-1/2 rounded-full bg-[#7a4a18]/55" />
        </span>
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-14 z-20 h-3 origin-bottom-left border-2 border-[#b07a3c] bg-[#eac28a] transition-transform duration-300 ease-out group-hover/box:-rotate-[18deg]",
            level > 0 && "-rotate-[28deg]",
          )}
          style={{ backgroundImage: CARDBOARD }}
        />
      </button>
    </Cell>
  );
}

/** The bottom tray: a rhythm game, a shy box tenant, and the colophon. */
export function Footer() {
  return (
    <footer className="pb-[env(safe-area-inset-bottom)] md:pt-4 md:pb-14">
      <Box square={false}>
        <EncoreCell />
        <ShyBox />
        <Cell tone="pink" className="justify-between gap-4">
          <p className="text-sm text-pink-950/65">
            made with actual care{" "}
            <span className="text-pink-950/40">(and probably too much coffee)</span>
          </p>
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[10px] tracking-[0.18em] text-pink-950/50 uppercase">
              tanstack · react · tailwind
            </p>
            <BuildDate />
            <a
              href="/rss.xml"
              className="relative z-10 mt-1 w-fit font-mono text-[11px] tracking-[0.18em] text-pink-700 uppercase hover:text-pink-950"
            >
              RSS feed ↗
            </a>
          </div>
        </Cell>
      </Box>
    </footer>
  );
}
