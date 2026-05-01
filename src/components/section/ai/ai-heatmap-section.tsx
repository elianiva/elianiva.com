import { AnimatedSection } from "~/components/ui/animated-section";
import { AnimatedItem } from "~/components/ui/animated-item";
import { Heading } from "~/components/ui/heading";
import { HeatmapGrid, type HeatmapCell } from "~/components/ui/heatmap-grid";
import type { AiContribution } from "~/lib/tokscale";

interface Props {
  contributions: AiContribution[];
  weeks: { days: HeatmapCell[] }[];
}

export function AiHeatmapSection({ contributions, weeks }: Props) {
  return (
    <AnimatedSection className="py-4 md:py-8">
      <AnimatedItem>
        <Heading level={2} right={`${contributions.length} days tracked`}>
          activity
        </Heading>
      </AnimatedItem>
      <AnimatedItem>
        <HeatmapGrid weeks={weeks} legendLabel="less" />
      </AnimatedItem>
    </AnimatedSection>
  );
}

