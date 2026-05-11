import { createFileRoute } from "@tanstack/react-router";
import { getAiUsage } from "~/features/ai/lib/tokscale";
import { seo, defaultOgImageUrl } from "~/lib/seo";
import { AiPage } from "~/features/ai/components/ai-page-body";
import { AiPageSkeleton } from "~/components/ui/page-skeleton";

export const Route = createFileRoute("/ai")({
  component: AiPage,
  pendingComponent: AiPageSkeleton,
  loader: () => getAiUsage(),
  head: () =>
    seo({
      title: "AI Usage",
      description: "AI token usage tracked by tokscale.ai",
      ogImage: defaultOgImageUrl("AI Usage", "AI token usage tracked by tokscale.ai"),
    }),
});
