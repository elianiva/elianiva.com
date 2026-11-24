import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
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

const REPO = "https://github.com/elianiva/elianiva.com";
const KIND_TONES: Record<string, string> = {
  feat: "bg-pink-200",
  fix: "bg-sky-200",
  chore: "bg-yellow-200",
};
// UTC, so the prerendered date matches the browser's.
const receiptDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

/** `fix(dev): x` becomes `{ kind: "fix", text: "x" }`. */
function parseSubject(subject: string) {
  const match = subject.match(/^(\w+)(?:\([^)]*\))?!?:\s*(.*)$/);
  return match ? { kind: match[1]!, text: match[2]! } : { kind: "misc", text: subject };
}

/**
 * The site's own changelog as a till receipt: the latest commits, one line
 * each with the date, the kind of change, and the hash, then the running
 * total. Read from git at build time, so it costs nothing in the browser.
 */
function ChangelogCell() {
  const { total, commits } = __SITE_HISTORY__;
  return (
    <Cell span="w2" tone="white" label="Changelog" className="gap-0 md:col-span-3 xl:col-span-5">
      <ol className="mt-2 flex flex-col font-mono text-[11px] text-pink-950">
        {commits.map((commit) => {
          const { kind, text } = parseSubject(commit.subject);
          return (
            <li
              key={commit.hash}
              className="flex items-baseline gap-2.5 border-t border-dashed border-pink-200 py-1.5 first:border-t-0"
            >
              <span className="w-12 shrink-0 text-pink-950/50 uppercase tabular-nums">
                {receiptDate.format(new Date(commit.date))}
              </span>
              <span
                className={cn(
                  "w-12 shrink-0 px-1 text-center text-[9px] tracking-wider uppercase",
                  KIND_TONES[kind] ?? "bg-purple-200",
                )}
              >
                {kind}
              </span>
              <span className="min-w-0 flex-1 truncate font-sans text-[13px]">{text}</span>
              <a
                href={`${REPO}/commit/${commit.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-pink-500 underline decoration-dotted underline-offset-2 hover:text-pink-700"
              >
                {commit.hash}
              </a>
            </li>
          );
        })}
      </ol>
      <div className="mt-auto flex items-end justify-between gap-4 border-t border-dashed border-pink-200 pt-2 font-mono text-[10px] uppercase">
        <span>
          Total <span className="text-pink-600">{total.toLocaleString("en-GB")}</span> commits
        </span>
        <span
          aria-hidden
          className="block h-5 w-28 bg-[repeating-linear-gradient(90deg,rgb(80_7_36)_0_1px,transparent_1px_3px,rgb(80_7_36)_3px_5px,transparent_5px_6px,rgb(80_7_36)_6px_7px,transparent_7px_10px)] opacity-60"
        />
      </div>
    </Cell>
  );
}

/** The bottom tray: the site's changelog and the colophon. */
export function Footer() {
  return (
    <footer className="pb-[env(safe-area-inset-bottom)] md:-mt-px md:pb-14">
      <Box square={false}>
        <ChangelogCell />
        <Cell tone="pink" className="justify-between gap-4 max-md:col-span-2">
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
