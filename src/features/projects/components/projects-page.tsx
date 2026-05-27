import { ProjectSection } from "./project-section";
import type { ProjectType } from "../lib/projects";

type ProjectSectionItem = {
  title: string;
  description: string;
  type: ProjectType;
};

const SECTIONS: ProjectSectionItem[] = [
  {
    title: "Personal Projects",
    description: "Mostly made them just for fun and to learn new things.",
    type: "personal",
  },
  {
    title: "Open Source Projects",
    description: "These are some open source projects I've helped building",
    type: "open-source",
  },
  {
    title: "Assignments",
    description: "Projects I've worked on during high school and university courses.",
    type: "assignment",
  },
];

export function ProjectsPage() {
  return (
    <div className="mx-auto max-w-container pt-10 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8 space-y-4">
        {SECTIONS.map((s) => (
          <ProjectSection key={s.type} {...s} featured={false} />
        ))}
      </div>
    </div>
  );
}
