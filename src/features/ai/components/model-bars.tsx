import type { AiModelUsage } from "../lib/tokscale";
import { fmtCost } from "./fmt";
import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "~/components/ui/progress";

export function ModelBars({ models }: { models: AiModelUsage[] }) {
  const sorted = models
    .slice()
    .sort((a, b) => b.cost - a.cost)
    .filter((m) => m.cost >= 0.01);
  const max = sorted[0]?.cost ?? 1;

  return (
    <div className="flex flex-col gap-2 font-mono text-xs">
      {sorted.map((m) => (
        <Progress
          key={m.model}
          value={(m.cost / max) * 100}
          className="grid grid-cols-[3fr_12fr_0.5fr_0.5fr] gap-3 items-center flex-nowrap"
        >
          <ProgressLabel className="text-pink-800 truncate text-xs" title={m.model}>
            {m.model}
          </ProgressLabel>
          <ProgressTrack className="h-4 bg-pink-100/50">
            <ProgressIndicator className="h-full bg-pink-400/50 transition-all duration-200" />
          </ProgressTrack>
          <ProgressValue className="text-pink-900 text-right text-xs">
            {() => fmtCost(m.cost)}
          </ProgressValue>
          <span className="text-pink-950/40 text-right text-xs">{m.percentage.toFixed(1)}%</span>
        </Progress>
      ))}
    </div>
  );
}
