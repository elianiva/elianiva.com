export type GitHubPullRequest = {
  id: string;
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  merged_at: string | null;
  created_at: string;
  updated_at: string;
  url: string;
  repository: {
    name: string;
    full_name: string;
    url: string;
    stargazerCount: number;
  };
  user: {
    login: string;
    url: string;
  };
  additions: number;
  deletions: number;
  changed_files: number;
};

export type GroupedPRs = {
  [repoName: string]: {
    repository: {
      name: string;
      full_name: string;
      url: string;
      stargazerCount: number;
    };
    prs: GitHubPullRequest[];
    mergedCount: number;
  };
};

export type PRContributionsResponse = {
  user: {
    contributionsCollection: {
      pullRequestContributionsByRepository: Array<{
        repository: {
          name: string;
          nameWithOwner: string;
          url: string;
          stargazerCount: number;
        };
        contributions: {
          nodes: Array<{
            pullRequest: {
              id: string;
              number: number;
              title: string;
              state: string;
              mergedAt: string | null;
              createdAt: string;
              updatedAt: string;
              url: string;
              additions: number;
              deletions: number;
              changedFiles: number;
              repository: {
                name: string;
                nameWithOwner: string;
                url: string;
                stargazerCount: number;
              };
              author: {
                login: string;
                url: string;
              };
            };
          } | null>;
        };
      }>;
    };
  };
};

export type ContributionDay = {
  date: string;
  contributionCount: number;
  contributionLevel:
    | "NONE"
    | "FIRST_QUARTILE"
    | "SECOND_QUARTILE"
    | "THIRD_QUARTILE"
    | "FOURTH_QUARTILE";
};

export type GitHubContributionsResponse = {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: {
          contributionDays: ContributionDay[];
        }[];
      };
    };
  };
};
