export type Experience = {
  company: string;
  position: string;
  location: string;
  time: "full-time" | "part-time" | "freelance" | "contract";
  period: [Date, Date | null];
  details: string[];
  technologies: string[];
};
