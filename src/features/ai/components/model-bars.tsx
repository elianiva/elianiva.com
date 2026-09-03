"use client";

import { useState } from "react";
import type { AiModelUsage } from "../lib/types";
import { fmtCost, fmtTokens } from "~/lib/fmt";

const tabs = ["by cost", "by tokens"] as const;
type SortBy = (typeof tabs)[number];

export function ModelBars({ models }: { models: AiModelUsage[] }) {
  const [sortBy, setSortBy] = useState<SortBy>("by cost");

  const by = (m: AiModelUsage) => (sortBy === "by cost" ? m.cost : m.tokens);
  const sorted = models.slice().sort((a, b) => by(b) - by(a));
  const max = by(sorted[0] ?? ({ cost: 1, tokens: 1 } as AiModelUsage));

  return (
    <div className="flex flex-col gap-3 font-mono text-xs">
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSortBy(tab)}
            className={`text-xs uppercase tracking-wider transition-colors ${
              sortBy === tab
                ? "text-pink-800 font-medium border-b-2"
                : "text-pink-950/30 hover:text-pink-950/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {sorted.map((m) => {
        const pct = (by(m) / max) * 100;
        return (
          <div key={m.model} className="grid grid-cols-[14rem_auto_3rem_3rem] gap-3 items-center">
            <span className="text-pink-800 truncate text-xs" title={m.model}>
              {m.model}
            </span>
            <div className="h-4 bg-pink-100/50">
              <div
                className="h-full bg-pink-400/50 transition-[width] duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-pink-900 text-right text-xs">{fmtCost(m.cost)}</span>
            <span className="text-pink-950/40 text-right text-xs">{fmtTokens(m.tokens)}</span>
          </div>
        );
      })}
    </div>
  );
}
