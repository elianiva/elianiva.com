import { getApi } from "~/lib/api";
import type { ContributionsResponse } from "./github.service";
import type { GroupedPRs } from "./types";

export function getGitHubPRs() {
  return getApi<{ grouped: GroupedPRs; totalPRs: number }>("/api/github/prs");
}

export function getGitHubContributions() {
  return getApi<ContributionsResponse | null>("/api/github/contributions");
}
