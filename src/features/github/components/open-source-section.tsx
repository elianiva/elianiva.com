import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getGitHubPRs } from "../lib/github-server";
import { PRDropdown } from "./pr-dropdown";
import { Heading } from "~/components/ui/heading";
import { Skeleton } from "~/components/ui/skeleton";

function OpenSourcePRList() {
  const { data } = useSuspenseQuery({
    queryKey: ["github-prs"],
    queryFn: () => getGitHubPRs(),
    staleTime: 1000 * 60 * 60,
  });

  const { grouped, totalPRs } = data;
  const projects = grouped.length;

  if (projects === 0) {
    return (
      <div className="text-center py-8 border border-pink-200 rounded-lg">
        <p className="text-sm font-body text-pink-950/60">
          No merged pull requests from the last year to show.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {grouped.map((group) => (
          <PRDropdown
            key={group.repository.full_name}
            repository={group.repository}
            prs={group.prs}
            mergedCount={group.mergedCount}
            lastMergedAt={group.lastMergedAt}
          />
        ))}
      </div>
      <p className="pt-3 text-xs font-mono text-pink-950/40">
        {totalPRs} merged pull request{totalPRs === 1 ? "" : "s"} across {projects} project
        {projects === 1 ? "" : "s"}
      </p>
    </>
  );
}

export function OpenSourceSection() {
  return (
    <section aria-labelledby="open-source-heading" className="min-w-0">
      <div>
        <Heading level={2} id="open-source-heading">
          Open Source Contributions
        </Heading>
      </div>
      <div>
        <p className="text-xs md:text-base font-body text-pink-950/70 pt-2 pb-4">
          Merged pull requests in other people&rsquo;s projects over the last year, most recent
          first.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        }
      >
        <OpenSourcePRList />
      </Suspense>
    </section>
  );
}
