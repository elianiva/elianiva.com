import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getAiUsageRsc } from "../lib/tokscale";
import { AiPageSkeleton } from "~/components/ui/page-skeleton";

function AiUsageList() {
  const { data } = useSuspenseQuery({
    queryKey: ["ai-usage"],
    queryFn: () => getAiUsageRsc(),
  });
  return <>{data}</>;
}

export function AiSection() {
  return (
    <Suspense fallback={<AiPageSkeleton />}>
      <AiUsageList />
    </Suspense>
  );
}
