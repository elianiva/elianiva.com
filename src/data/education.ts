import type { Period } from "~/types/work-experience";

export interface Education {
  institution: string;
  location: string;
  degree: string;
  period: Period;
  details: string[];
}

export const education: Education[] = [
  {
    institution: "State Polytechnic of Malang",
    location: "Malang",
    degree: "Bachelor's of Applied Science, Informatics Engineering",
    period: ["2022-08", "2026-08"],
    details: ["Cumulative GPA: 3.86/4.0"],
  },
];
