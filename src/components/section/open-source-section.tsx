import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { getGitHubPRs } from "~/lib/github";
import { PRDropdown } from "~/components/opensource/pr-dropdown";
import { Heading } from "../ui/heading";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
};

export function OpenSourceSection() {
  const { data } = useSuspenseQuery({
    queryKey: ["github-prs"],
    queryFn: () => getGitHubPRs(),
    staleTime: 1000 * 60 * 60,
  });

  const prefersReducedMotion = useReducedMotion();
  const { grouped, totalPRs } = data;
  const repos = Object.entries(grouped);

  return (
    <motion.section
      className="py-4 md:py-8 px-2 md:px-8"
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
          Here are some of my merged pull requests across various open source projects.
          {totalPRs > 0 && (
            <span className="ml-1">
              ({totalPRs} PRs across {repos.length} repositories)
            </span>
          )}
        </p>
      </motion.div>

      {repos.length === 0 ? (
        <motion.div variants={item} className="text-center py-8 border border-pink-200 rounded-lg">
          <p className="text-sm font-body text-pink-950/60">
            No contributions loaded. Set GH_TOKEN to fetch pull requests.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-1">
          {repos.map(([repoName, group]) => (
            <PRDropdown key={repoName} repository={group.repository} prs={group.prs} />
          ))}
        </motion.div>
      )}
    </motion.section>
  );
}
