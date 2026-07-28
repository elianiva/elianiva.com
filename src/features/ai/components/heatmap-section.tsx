import { Heading } from "~/components/ui/heading";
import { HeatmapGrid, type HeatmapCell } from "~/components/ui/heatmap-grid";
import { fmtTokens, fmtCost } from "./fmt";
import type { AiContribution } from "../lib/types";

interface Props {
  contributions: AiContribution[];
  weeks: { days: (HeatmapCell | null)[] }[];
}

export function HeatmapSection({ contributions, weeks }: Props) {
  const monthlyCost = contributions.reduce((s, d) => s + d.totals.cost, 0);
  const monthlyTokens = contributions.reduce((s, d) => s + d.totals.tokens, 0);

  return (
    <section className="py-4 md:py-8">
      <div>
        <Heading level={2} right={`${fmtCost(monthlyCost)} · ${fmtTokens(monthlyTokens)}`}>
          Activity
        </Heading>
      </div>
      <div className="overflow-x-auto">
        <HeatmapGrid weeks={weeks} />
      </div>
    </section>
  );
}
