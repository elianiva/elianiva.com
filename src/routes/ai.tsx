import { createFileRoute } from "@tanstack/react-router";
import { useLoaderData } from "@tanstack/react-router";
import { getAiUsage } from "~/features/ai/lib/tokscale";
import { seo } from "~/lib/seo";
import { AiPage } from "~/features/ai/components/ai-page-body";

export const Route = createFileRoute("/ai")({
  component: AiPage,
  head: () => seo({ title: "AI Usage", description: "AI token usage tracked by tokscale.ai" }),
  loader: () => getAiUsage(),
});

function AiPage() {
  const data = useLoaderData({ from: Route.id });

  if (!data) {
    return (
      <div className="mx-auto max-w-container pt-20 border-x border-pink-200/50 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <p className="font-mono text-sm text-pink-950/40">
            couldn&apos;t reach tokscale. try again later.
          </p>
        </div>
      </div>
    );
  }

  return <AiPage data={data} />;
}
