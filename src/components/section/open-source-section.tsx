import { useSuspenseQuery } from "@tanstack/react-query";
import { getGitHubPRs } from "~/lib/github";
import { PRDropdown } from "~/components/opensource/pr-dropdown";
import { Heading } from "../ui/heading";

export function OpenSourceSection() {
  const { data } = useSuspenseQuery({
    queryKey: ["github-prs"],
    queryFn: () => getGitHubPRs(),
    staleTime: 1000 * 60 * 60,
  });

  const { grouped, totalPRs } = data;
  const repos = Object.entries(grouped);

  return (
    <section className="py-4 md:py-8 px-2 md:px-8">
      <Heading level={2} data-anime id="open-source-heading">
        Open Source Contributions
      </Heading>
      <p data-anime className="text-xs md:text-base font-body text-pink-950/70 pt-2 pb-4">
        Here are some of my merged pull requests across various open source projects.
        {totalPRs > 0 && (
          <span className="ml-1">
            ({totalPRs} PRs across {repos.length} repositories)
          </span>
        )}
      </p>

      {repos.length === 0 ? (
        <div data-anime className="text-center py-8 border border-pink-200 rounded-lg">
          <p className="text-sm font-body text-pink-950/60">
            No contributions loaded. Set GH_TOKEN to fetch pull requests.
          </p>
        </div>
      ) : (
        <div data-anime className="space-y-1">
          {repos.map(([repoName, group]) => (
            <PRDropdown key={repoName} repository={group.repository} prs={group.prs} />
          ))}
        </div>
      )}
    </section>
  );
}
