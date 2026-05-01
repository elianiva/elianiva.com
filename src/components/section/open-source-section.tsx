import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getGitHubPRs } from "~/lib/github";
import { PRDropdown } from "~/components/opensource/pr-dropdown";
import { Heading } from "~/components/ui/heading";
import { Skeleton } from "~/components/ui/skeleton";
import { AnimatedSection } from "~/components/ui/animated-section";
import { AnimatedItem } from "~/components/ui/animated-item";

function OpenSourcePRList() {
  const { data } = useSuspenseQuery({
    queryKey: ["github-prs"],
    queryFn: () => getGitHubPRs(),
    staleTime: 1000 * 60 * 60,
  });

  const repos = Object.entries(data.grouped);

  if (repos.length === 0) {
    return (
      <AnimatedItem className="text-center py-8 border border-pink-200 rounded-lg">
        <p className="text-sm font-body text-pink-950/60">
          No contributions loaded. Set GH_TOKEN to fetch pull requests.
        </p>
      </AnimatedItem>
    );
  }

  return (
    <>
      {repos.map(([repoName, group]) => (
        <AnimatedItem key={repoName} className="space-y-1">
          <PRDropdown repository={group.repository} prs={group.prs} />
        </AnimatedItem>
      ))}
    </>
  );
}

export function OpenSourceSection() {
  return (
    <AnimatedSection className="py-4 md:py-8 pr-2 md:pr-8">
      <AnimatedItem>
        <Heading level={2} id="open-source-heading">
          Open Source Contributions
        </Heading>
      </AnimatedItem>
      <AnimatedItem>
        <p className="text-xs md:text-base font-body text-pink-950/70 pt-2 pb-4">
          Some of my merged pull requests across various open source projects.
        </p>
      </AnimatedItem>

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
    </AnimatedSection>
  );
}