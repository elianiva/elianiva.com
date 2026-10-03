import { Tooltip, TooltipTrigger, TooltipContent } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export type HeatmapCell = {
  date: string;
  intensity: number; // 0..4
  tooltip: string;
};

type Week = { days: (HeatmapCell | null)[] };
type Column = (HeatmapCell | null)[];

const INTENSITY_COLORS = [
  "bg-pink-100/40",
  "bg-pink-200/70",
  "bg-pink-300/80",
  "bg-pink-400/80",
  "bg-pink-500",
];

const DAY_MS = 86_400_000;
const WEEK_COUNT = 53;
/**
 * Phones get half a year. Fitting 53 columns into a 390px viewport leaves ~4px
 * cells and month labels with nowhere to go.
 */
export const COMPACT_WEEK_COUNT = 26;

/** A label needs this many columns to itself before the next one collides with it. */
const MIN_LABEL_COLUMNS = 3;

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Lays the days out in Sunday-to-Saturday columns, newest week last. */
function buildColumns(weeks: Week[]): Column[] {
  const columns: Column[] = Array.from({ length: WEEK_COUNT }, () => Array(7).fill(null));
  const allDays = weeks.flatMap((w) => w.days.filter((d): d is HeatmapCell => d !== null));
  if (!allDays.length) return columns;

  const last = allDays[allDays.length - 1];
  const endDate = new Date(last.date + "T00:00:00Z");
  const endSundayMs = endDate.getTime() - endDate.getUTCDay() * DAY_MS;

  for (const d of allDays) {
    const dt = new Date(d.date + "T00:00:00Z");
    const thisSundayMs = dt.getTime() - dt.getUTCDay() * DAY_MS;
    const weeksAgo = Math.round((endSundayMs - thisSundayMs) / (7 * DAY_MS));
    const col = WEEK_COUNT - 1 - weeksAgo;
    if (col >= 0 && col < WEEK_COUNT) columns[col][dt.getUTCDay()] = d;
  }
  return columns;
}

type MonthLabel = {
  /** 1-based grid column the label starts at. */
  column: number;
  /** How many columns the label's month covers. */
  span: number;
  text: string;
};

function monthOf(date: string): { key: string; text: string } {
  const d = new Date(date + "T00:00:00Z");
  return {
    key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`,
    text: MONTH_NAMES[d.getUTCMonth()],
  };
}

/**
 * One label per run of consecutive columns sharing a month, placed on the run's
 * first column. Labels overflow their column — they are wider than one — so runs
 * too narrow to hold a label get none instead of colliding with the next month.
 */
function getMonthLabels(columns: Column[]): MonthLabel[] {
  const runs: Array<{ key: string; text: string; start: number; end: number }> = [];

  for (let i = 0; i < columns.length; i++) {
    const first = columns[i].find((d): d is HeatmapCell => d !== null);
    // A column without days belongs to whichever month was already open.
    if (!first) continue;
    const { key, text } = monthOf(first.date);
    const open = runs.at(-1);
    if (open?.key === key) open.end = i;
    else runs.push({ key, text, start: i, end: i });
  }

  return runs
    .filter((run) => run.end - run.start + 1 >= MIN_LABEL_COLUMNS)
    .map((run) => ({
      column: run.start + 1,
      span: run.end - run.start + 1,
      text: run.text,
    }));
}

function Heatmap({ columns, className }: { columns: Column[]; className: string }) {
  const monthLabels = getMonthLabels(columns);

  return (
    <div
      className={cn("grid gap-0.75", className)}
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
    >
      {monthLabels.map((label) => (
        <span
          key={`${label.column}-${label.text}`}
          className="text-[10px] font-mono uppercase tracking-wider text-pink-950/40 whitespace-nowrap pointer-events-none"
          style={{
            gridRow: 1,
            gridColumn: `${label.column} / span ${label.span}`,
            justifySelf: "start",
          }}
        >
          {label.text}
        </span>
      ))}

      {columns.map((column, colIndex) =>
        column.map((cell, dayIndex) => {
          if (!cell) {
            return (
              <div
                key={`empty-${colIndex}-${dayIndex}`}
                className="aspect-square bg-pink-100/20"
                style={{ gridRow: dayIndex + 2, gridColumn: colIndex + 1 }}
              />
            );
          }

          const color = INTENSITY_COLORS[Math.min(4, Math.max(0, cell.intensity))];
          return (
            <Tooltip key={cell.date}>
              <TooltipTrigger
                render={
                  <div
                    className={cn(
                      "cursor-default aspect-square transition-colors duration-150",
                      color,
                    )}
                    style={{ gridRow: dayIndex + 2, gridColumn: colIndex + 1 }}
                  />
                }
              ></TooltipTrigger>
              <TooltipContent className="pointer-events-none">{cell.tooltip}</TooltipContent>
            </Tooltip>
          );
        }),
      )}
    </div>
  );
}

interface Props {
  weeks: Week[];
  legendLabel?: string;
  emptyLabel?: string;
}

export function HeatmapGrid({ weeks, legendLabel, emptyLabel = "No data available." }: Props) {
  const allDays = weeks.flatMap((w) => w.days.filter((d): d is HeatmapCell => d !== null));
  if (!allDays.length) {
    return <p className="pt-2 text-sm font-body text-pink-950/60">{emptyLabel}</p>;
  }

  const columns = buildColumns(weeks);

  return (
    <div className="relative pt-4 w-full">
      <Heatmap columns={columns} className="hidden sm:grid" />
      <Heatmap columns={columns.slice(-COMPACT_WEEK_COUNT)} className="grid sm:hidden" />

      <div className="flex items-center gap-1 mt-3">
        <span className="text-xs font-mono text-pink-950/30">{legendLabel ?? "less"}</span>
        {INTENSITY_COLORS.map((color, level) => (
          <div key={level} className={cn("size-4", color)} />
        ))}
        <span className="text-xs font-mono text-pink-950/30">more</span>
      </div>
    </div>
  );
}
