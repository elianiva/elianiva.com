import { createFileRoute } from "@tanstack/react-router";
import { AiSection } from "~/features/ai/components/ai-section";
import { seo, defaultOgImageUrl } from "~/lib/seo";

export const Route = createFileRoute("/ai")({
  component: AiSection,
  head: () =>
    seo({
      title: "AI Usage",
      description: "AI token usage tracked by tokscale.ai",
      ogImage: defaultOgImageUrl("AI Usage", "AI token usage tracked by tokscale.ai"),
    }),
});
