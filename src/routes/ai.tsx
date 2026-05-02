import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { getAiUsage } from "~/features/ai/lib/tokscale";
import { AiPage } from "~/features/ai/components/ai-page-body";
import { seo } from "~/lib/seo";

const getAiPage = createServerFn({ method: "GET" }).handler(async () => {
  const data = await getAiUsage();
  if (!data) return null;
  return renderServerComponent(<AiPage data={data} />);
});

export const Route = createFileRoute("/ai")({
  component: AiPageRoute,
  head: () => seo({ title: "AI Usage", description: "AI token usage tracked by tokscale.ai" }),
  loader: () => getAiPage(),
});

function AiPageRoute() {
  const page = Route.useLoaderData();
  if (!page) {
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
  return <>{page}</>;
}
