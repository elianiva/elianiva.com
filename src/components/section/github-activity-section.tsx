import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getGitHubContributions } from "~/lib/github";
import { useCountUp } from "~/hooks/use-count-up";
import { Heading } from "../ui/heading";

const LEVEL_COLORS: Record<string, string> = {
  NONE: "bg-pink-100/40",
  FIRST_QUARTILE: "bg-pink-200/70",
  SECOND_QUARTILE: "bg-pink-300/80",
  THIRD_QUARTILE: "bg-pink-400/80",
  FOURTH_QUARTILE: "bg-pink-500",
};

const LEVEL_HOVER: Record<string, string> = {
  NONE: "hover:bg-pink-200/50",
  FIRST_QUARTILE: "hover:bg-pink-300",
  SECOND_QUARTILE: "hover:bg-pink-400",
  THIRD_QUARTILE: "hover:bg-pink-500",
  FOURTH_QUARTILE: "hover:bg-pink-600",
};

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.004,
    },
  },
} as const;

const cell = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15, ease: [0.19, 1, 0.22, 1] },
  },
} as const;

function AnimatedCount({ target }: { target: number }) {
  const { ref, display } = useCountUp(target, 1.8);
  return (
    <span
      ref={ref}
      className="text-4xl md:text-5xl font-mono font-bold text-pink-500 tracking-tight tabular-nums"
    >
      {formatNumber(display)}
    </span>
  );
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function getMonthLabels(weeks: { contributionDays: { date: string }[] }[]): string[] {
  const labels: string[] = [];
  let lastMonth = -1;
  for (const week of weeks) {
    const firstDay = week.contributionDays[0];
    if (!firstDay) continue;
    const date = new Date(firstDay.date);
    const month = date.getMonth();
    if (month !== lastMonth) {
      labels.push(date.toLocaleDateString("en-US", { month: "short" }).toLowerCase());
      lastMonth = month;
    } else {
      labels.push("");
    }
  }
  return labels;
}

export function GitHubActivitySection() {
  const { data } = useSuspenseQuery({
    queryKey: ["github-contributions"],
    queryFn: () => getGitHubContributions(),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const prefersReducedMotion = useReducedMotion();
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number } | null>(null);

  if (!data) {
    return (
      <motion.section
        className="py-4 md:py-8 px-2 md:px-8 relative with-box-underline"
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0, y: 24 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] } },
        }}
      >
        <Heading level={2} id="github-activity-heading">
          Git Activity
        </Heading>
        <p className="text-sm font-body text-pink-950/60 pt-2">
          Set GH_TOKEN to fetch contribution data.
        </p>
      </motion.section>
    );
  }

  const { totalContributions, weeks, longestStreak } = data;
  const monthLabels = getMonthLabels(weeks);

  return (
    <motion.section
      className="py-4 md:py-8 px-2 md:px-8 relative with-box-underline"
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 24 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] } },
        }}
      >
        <Heading level={2} id="github-activity-heading">
          Git Activity
        </Heading>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 24 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] } },
        }}
        className="pt-2 pb-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <AnimatedCount target={totalContributions} />
            <span className="text-sm font-mono text-pink-950/50">
              contributions · past 365 days
            </span>
          </div>
          <div className="text-sm font-mono text-pink-950/40">
            longest streak · {longestStreak}d
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 24 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] } },
        }}
        className="relative"
      >
        {/* Month labels */}
        <div className="flex gap-0.75 mb-1 text-[10px] font-mono text-pink-950/30 uppercase tracking-wider">
          {monthLabels.map((label, i) => (
            <div key={i} className="w-4 text-center shrink-0">
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <motion.div
            className="flex gap-0.75 w-full"
            variants={prefersReducedMotion ? undefined : container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-0.75">
                {week.contributionDays.map((day, dayIdx) => (
                  <motion.div
                    key={dayIdx}
                    variants={prefersReducedMotion ? undefined : cell}
                    className={`
                      size-4 cursor-default transition-colors duration-150
                      ${LEVEL_COLORS[day.contributionLevel] || LEVEL_COLORS.NONE}
                      ${LEVEL_HOVER[day.contributionLevel] || LEVEL_HOVER.NONE}
                    `}
                    title={`${day.date}: ${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"}`}
                    onMouseEnter={() =>
                      setHoveredCell({ date: day.date, count: day.contributionCount })
                    }
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-pink-950/30">less</span>
            {["NONE", "FIRST_QUARTILE", "SECOND_QUARTILE", "THIRD_QUARTILE", "FOURTH_QUARTILE"].map(
              (level) => (
                <div key={level} className={`size-4 ${LEVEL_COLORS[level]}`} />
              ),
            )}
            <span className="text-[10px] font-mono text-pink-950/30">more</span>
          </div>

          {/* Hover tooltip */}
          <div className="h-4">
            {hoveredCell && (
              <span className="text-[10px] font-mono text-pink-950/40">
                {hoveredCell.date} · {hoveredCell.count} contribution
                {hoveredCell.count === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
