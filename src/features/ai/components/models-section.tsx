import { Heading } from "~/components/ui/heading";
import { ModelBars } from "./model-bars";
import type { AiModelUsage } from "../lib/tokscale";

interface Props {
  models: AiModelUsage[];
}

export function ModelsSection({ models }: Props) {
  return (
    <section className="py-4 md:py-8">
      <Heading level={2} right={`${models.length} models`}>
        Models
      </Heading>
      <ModelBars models={models} />
    </section>
  );
}

