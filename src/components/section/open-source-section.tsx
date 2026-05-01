import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { getGitHubPRs } from "~/lib/github";
import { PRDropdown } from "~/components/opensource/pr-dropdown";
import { Heading } from "~/components/ui/heading";
import { Skeleton } from "~/components/ui/skeleton";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
} as const;

function OpenSourcePRList() {
  const { data } = useSuspenseQuery({
    queryKey: ["github-prs"],
    queryFn: () => getGitHubPRs(),
    staleTime: 1000 * 60 * 60,
  });

  const repos = Object.entries(data.grouped);

  if (repos.length === 0) {
    return (
      <motion.div variants={item} className="text-center py-8 border border-pink-200 rounded-lg">
        <p className="text-sm font-body text-pink-950/60">
          No contributions loaded. Set GH_TOKEN to fetch pull requests.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={item} className="space-y-1">
      {repos.map(([repoName, group]) => (
        <PRDropdown key={repoName} repository={group.repository} prs={group.prs} />
      ))}
    </motion.div>
  );
}

export function OpenSourceSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      className="py-4 md:py-8 pr-2 md:pr-8"
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={container}
    >
      <motion.div variants={item}>
        <Heading level={2} id="open-source-heading">
          Open Source Contributions
        </Heading>
      </motion.div>
      <motion.div variants={item}>
        <p className="text-xs md:text-base font-body text-pink-950/70 pt-2 pb-4">
          Some of my merged pull requests across various open source projects.
        </p>
      </motion.div>

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
    </motion.section>
  );
}
