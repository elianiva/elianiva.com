import type { Technology } from "~/types/technology";

/** How the role was held. The CV capitalises it and adds ", Remote". */
export type Engagement = "full-time" | "part-time" | "freelance" | "contract";

/** A `YYYY-MM` start and an end that is still `null` when the role is current. */
export type Period = [start: string, end: string | null];

/** One role, as authored. This is the single source for the site and the CV. */
export interface Work {
  /** Whether the CV prints this role. The site prints every role. */
  cv: boolean;
  /** Short brand, e.g. `IPB Training`. */
  company: string;
  /** Registered entity, where it differs from the brand. */
  legalName?: string;
  position: string;
  time: Engagement;
  remote: boolean;
  country: string;
  /** Omitted where the role has no single city. */
  city?: string;
  period: Period;
  details: string[];
  technologies: Technology[];
}

/** A role, as the site renders it. */
export interface WorkExperience {
  company: string;
  position: string;
  /** Country badge, lower case, e.g. `indonesia`. */
  location: string;
  time: Engagement;
  period: [Date, Date | null];
  details: string[];
  technologies: Technology[];
}
