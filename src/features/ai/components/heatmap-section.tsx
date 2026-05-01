import { AnimatedSection } from "~/components/ui/animated-section";
import { AnimatedItem } from "~/components/ui/animated-item";
import { Heading } from "~/components/ui/heading";
import { HeatmapGrid, type HeatmapCell } from "~/components/ui/heatmap-grid";
import { fmtTokens, fmtCost } from "./fmt";
import type { AiContribution } from "../lib/tokscale";

interface Props {
  contributions: AiContribution[];
  weeks: { days: (HeatmapCell | null)[] }[];
}

export function AiHeatmapSection({ contributions, weeks }: Props) {
  const monthlyCost = contributions.reduce((s, d) => s + d.totals.cost, 0);
  const monthlyTokens = contributions.reduce((s, d) => s + d.totals.tokens, 0);

  return (
    <AnimatedSection className="py-4 md:py-8">
      <AnimatedItem>
        <Heading level={2} right={`${fmtCost(monthlyCost)} · ${fmtTokens(monthlyTokens)}`}>
          Activity
        </Heading>
      </AnimatedItem>
      <AnimatedItem className="overflow-x-auto">
        <HeatmapGrid weeks={weeks} />
      </AnimatedItem>
    </AnimatedSection>
  );
}
