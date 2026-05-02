import { createFileRoute } from "@tanstack/react-router";
import { getAiUsage } from "~/features/ai/lib/tokscale";
import { seo } from "~/lib/seo";
import { AiPage } from "~/features/ai/components/ai-page-body";

export const Route = createFileRoute("/ai")({
  component: AiPage,
  head: () => seo({ title: "AI Usage", description: "AI token usage tracked by tokscale.ai" }),
  loader: () => getAiUsage(),
});
