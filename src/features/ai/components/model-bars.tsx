import type { AiModelUsage } from "../lib/tokscale";
import { fmtCost } from "./fmt";

export function ModelBars({ models }: { models: AiModelUsage[] }) {
  const sorted = models.toSorted((a, b) => b.cost - a.cost).filter((m) => m.cost >= 0.01);
  const max = sorted[0]?.cost ?? 1;

  return (
    <div className="flex flex-col gap-2 font-mono text-xs">
      {sorted.map((m) => (
        <div key={m.model} className="grid grid-cols-[3fr_12fr_0.5fr_0.5fr] gap-3 items-center">
          <span className="text-pink-800 truncate" title={m.model}>
            {m.model}
          </span>
          <div className="h-2 bg-pink-100 overflow-hidden">
            <div
              className="h-full bg-pink-400 transition-all duration-200"
              style={{ width: `${(m.cost / max) * 100}%` }}
            />
          </div>
          <span className="text-pink-900 text-right">{fmtCost(m.cost)}</span>
          <span className="text-pink-950/40 text-right">{m.percentage.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}
