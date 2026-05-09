import { LazyMotion, m, domAnimation } from "motion/react";
import { useReducedMotion } from "~/lib/motion";
import { Tooltip, TooltipTrigger, TooltipContent } from "~/components/ui/tooltip";

export type HeatmapCell = {
  date: string;
  dateLabel: string;
  intensity: number; // 0..4
  tooltip: string;
};

const INTENSITY_COLORS = [
  "bg-pink-100/40",
  "bg-pink-200/70",
  "bg-pink-300/80",
  "bg-pink-400/80",
  "bg-pink-500",
];

const cellAnim = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15, ease: [0.19, 1, 0.22, 1] },
  },
} as const;

const gridAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.004 } },
} as const;

function buildGrid(weeks: { days: (HeatmapCell | null)[] }[]) {
  const WEEKS = 53;
  const cols: (HeatmapCell | null)[][] = Array.from({ length: WEEKS }, () => Array(7).fill(null));
  if (!weeks.length) return cols;
  const allDays = weeks.flatMap((w) => w.days.filter((d): d is HeatmapCell => d !== null));
  if (!allDays.length) return cols;
  const last = allDays[allDays.length - 1];
  const endDate = new Date(last.date + "T00:00:00Z");
  const endSundayMs = endDate.getTime() - endDate.getUTCDay() * 86400000;
  for (const d of allDays) {
    const dt = new Date(d.date + "T00:00:00Z");
    const dow = dt.getUTCDay();
    const thisSundayMs = dt.getTime() - dow * 86400000;
    const weeksAgo = Math.round((endSundayMs - thisSundayMs) / (7 * 86400000));
    const col = WEEKS - 1 - weeksAgo;
    if (col >= 0 && col < WEEKS) cols[col][dow] = d;
  }
  return cols;
}

// For each month name that appears in multiple separate spans,
// only show the label on the span with the most non-empty cells.
function getMonthLabels(cols: (HeatmapCell | null)[][]): string[] {
  // First pass: determine each column's dominant month
  type Span = { start: number; end: number; month: string; year: number; count: number };
  const spans: Span[] = [];
  let cur: Span | null = null;

  for (let i = 0; i < cols.length; i++) {
    const col = cols[i];
    const cells = col.filter(Boolean) as HeatmapCell[];
    if (!cells.length) {
      if (cur) spans.push(cur);
      cur = null;
      continue;
    }

    // Count days per month in this column
    const counts = new Map<string, { count: number; year: number }>();
    for (const c of cells) {
      const d = new Date(c.date + "T00:00:00Z");
      const key = d.toLocaleDateString("en-US", { month: "short" }).toLowerCase();
      const existing = counts.get(key) ?? { count: 0, year: d.getFullYear() };
      existing.count++;
      existing.year = d.getFullYear();
      counts.set(key, existing);
    }

    // Find dominant month in this column
    let best = "";
    let bestCount = 0;
    let bestYear = 0;
    for (const [month, info] of counts) {
      if (info.count > bestCount) {
        best = month;
        bestCount = info.count;
        bestYear = info.year;
      }
    }

    if (cur && cur.month === best && cur.year === bestYear) {
      cur.end = i;
      cur.count += bestCount;
    } else {
      if (cur) spans.push(cur);
      cur = { start: i, end: i, month: best, year: bestYear, count: bestCount };
    }
  }
  if (cur) spans.push(cur);

  // For each month name, find the span with the most cells.
  // Only that span gets a label.
  const bestSpanPerMonth = new Map<string, Span>();
  for (const s of spans) {
    const existing = bestSpanPerMonth.get(s.month);
    if (!existing || s.count > existing.count) {
      bestSpanPerMonth.set(s.month, s);
    }
  }

  // Build label array
  const labels: string[] = Array.from({ length: cols.length });
  for (const s of spans) {
    if (bestSpanPerMonth.get(s.month) === s) {
      labels[s.start] = s.month;
    }
  }

  return labels;
}

interface Props {
  weeks: { days: (HeatmapCell | null)[] }[];
  legendLabel?: string;
  emptyLabel?: string;
}

export function HeatmapGrid({ weeks, legendLabel, emptyLabel = "No data available." }: Props) {
  const prefersReducedMotion = useReducedMotion();

  const allDays = weeks.flatMap((w) => w.days.filter((d): d is HeatmapCell => d !== null));
  if (!allDays.length) {
    return <p className="pt-2 text-sm font-body text-pink-950/60">{emptyLabel}</p>;
  }

  const cols = buildGrid(weeks);
  const monthLabels = getMonthLabels(cols);

  return (
    <div className="relative pt-4 w-full">
      <div className="flex gap-0.75 mb-1 text-[10px] font-mono text-pink-950/30 uppercase tracking-wider">
        {monthLabels.map((label, i) => (
          <div key={`${label}-${i}`} className="flex-1 text-center truncate" title={label || undefined}>
            {label}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto w-full">
        <LazyMotion features={domAnimation}>
        <m.div
          className="flex gap-0.75 w-full"
          variants={prefersReducedMotion ? undefined : gridAnim}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {cols.map((col, colIdx) => {
            const firstCell = col.find(Boolean);
            const weekKey = firstCell?.date ?? `empty-${colIdx}`;
            return (
            <div key={weekKey} className="flex flex-col gap-0.75 flex-1 min-w-0">
              {col.map((d, rowIdx) => {
                if (!d) {
                  return (
                    <div
                      key={`empty-${weekKey}-${rowIdx}`}
                      className="bg-pink-100/20"
                      style={{ aspectRatio: "1" }}
                    />
                  );
                }
                const colorIdx = Math.min(4, Math.max(0, d.intensity));
                return (
                  <Tooltip key={d.date}>
                    <TooltipTrigger
                      render={
                        <m.div
                          variants={prefersReducedMotion ? undefined : cellAnim}
                          style={{ aspectRatio: "1" }}
                          className={[
                            "cursor-default active:outline-none transition-colors duration-150",
                            INTENSITY_COLORS[colorIdx],
                          ].join(" ")}
                        />
                      }
                    ></TooltipTrigger>
                    <TooltipContent className="pointer-events-none">{d.tooltip}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            );
          })}
        </m.div>
        </LazyMotion>
      </div>

      <div className="flex items-center gap-1 mt-3">
        <span className="text-xs font-mono text-pink-950/30">{legendLabel ?? "less"}</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div key={level} className={["size-4", INTENSITY_COLORS[level]].join(" ")} />
        ))}
        <span className="text-xs font-mono text-pink-950/30">more</span>
      </div>
    </div>
  );
}
