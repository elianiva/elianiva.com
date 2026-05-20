import { createFileRoute } from "@tanstack/react-router";
import { RscSection } from "~/components/rsc-section";
import { getAiUsageRsc } from "~/features/ai/lib/tokscale";
import { AiPageSkeleton } from "~/components/ui/page-skeleton";
import { seo, defaultOgImageUrl } from "~/lib/seo";

function AiRoute() {
  return (
    <RscSection
      queryKey={["ai-usage"]}
      queryFn={getAiUsageRsc}
      fallback={<AiPageSkeleton />}
    />
  );
}

export const Route = createFileRoute("/ai")({
  component: AiRoute,
  head: () =>
    seo({
      title: "AI Usage",
      description: "AI token usage tracked by tokscale.ai",
      ogImage: defaultOgImageUrl("AI Usage", "AI token usage tracked by tokscale.ai"),
    }),
});
