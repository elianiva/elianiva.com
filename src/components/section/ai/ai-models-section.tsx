import { AnimatedSection } from "~/components/ui/animated-section";
import { AnimatedItem } from "~/components/ui/animated-item";
import { Heading } from "~/components/ui/heading";
import { ModelBars } from "../../ai/model-bars";
import type { AiModelUsage } from "~/lib/tokscale";

interface Props {
  models: AiModelUsage[];
}

export function AiModelsSection({ models }: Props) {
  return (
    <AnimatedSection className="py-4 md:py-8">
      <AnimatedItem>
        <Heading level={2} right={models.length + " models · sorted by $ spent"}>
          models
        </Heading>
      </AnimatedItem>
      <AnimatedItem>
        <ModelBars models={models} />
      </AnimatedItem>
    </AnimatedSection>
  );
}
