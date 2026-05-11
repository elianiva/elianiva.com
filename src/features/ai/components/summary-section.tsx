import { Heading } from "~/components/ui/heading";
import { fmtTokens, fmtCost } from "./fmt";
import type { AiUsage } from "../lib/tokscale";
import { cn } from "~/lib/utils";
import { Card } from "~/components/ui/card";

interface Props {
  data: AiUsage;
  avgDaily: number;
}

type StatCardProps = {
  label: string;
  title: string;
  value: React.ReactNode;
  unit: string;
  extras: React.ReactNode;
  className?: string;
};

function StatCard(props: StatCardProps) {
  return (
    <Card className={cn("flex flex-col gap-3 py-5 px-4 border-0 ring-0", props.className)}>
      <div className="flex justify-between items-center text-xs text-pink-950/40 uppercase tracking-wide pb-2 border-b border-dashed border-pink-200">
        <span className="text-pink-400 font-semibold tracking-wider">{props.title}</span>
        <span>{props.label}</span>
      </div>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="font-display text-3xl md:text-4xl text-pink-400 tabular-nums">
          {props.value}
        </span>
        <span className="font-mono text-xs text-pink-950/40">{props.unit}</span>
      </div>
      <div className="flex gap-2 flex-wrap items-baseline font-mono text-xs text-pink-950/40">
        {props.extras}
      </div>
    </Card>
  );
}

export function SummarySection({ data, avgDaily }: Props) {
  return (
    <section className="py-4 md:py-8">
      <Heading level={2} right={"totals since " + data.dateRange.start}>
        Summary
      </Heading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <StatCard
          className="border-r pr-2"
          title="cost total"
          label="usd"
          value={fmtCost(data.stats.totalCost)}
          unit="burned"
          extras={
            <>
              <span>
                avg <b className="text-pink-800 font-normal">{fmtCost(avgDaily)}/active day</b>
              </span>
              <span>·</span>
              <span>{data.stats.activeDays}d active</span>
            </>
          }
        />
        <StatCard
          className="border-r pr-2"
          title="tokens total"
          label="counted"
          value={fmtTokens(data.stats.totalTokens)}
          unit="tokens"
          extras={
            <>
              <span>
                {fmtTokens(
                  data.stats.totalTokens
                    ? Math.round(data.stats.totalTokens / data.stats.submissionCount || 1)
                    : 0,
                )}{" "}
                avg/sub
              </span>
              <span>·</span>
              <span>{data.stats.submissionCount} submissions</span>
            </>
          }
        />
        <StatCard
          title="cache hit"
          label="prompt caching"
          value={
            data.stats.totalTokens > 0
              ? ((data.stats.cacheReadTokens / data.stats.totalTokens) * 100).toFixed(1) + "%"
              : "0%"
          }
          unit="hit rate"
          extras={
            <>
              <span>
                read{" "}
                <b className="text-pink-800 font-normal">{fmtTokens(data.stats.cacheReadTokens)}</b>
              </span>
              <span>·</span>
              <span>
                write{" "}
                <b className="text-pink-800 font-normal">
                  {fmtTokens(data.stats.cacheWriteTokens)}
                </b>
              </span>
            </>
          }
        />
      </div>
    </section>
  );
}

