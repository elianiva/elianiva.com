import { ProjectSection } from "./project-section";
import type { ProjectType } from "~/features/content/lib/projects";

type ProjectSectionItem = {
  title: string;
  type: ProjectType;
};

const SECTIONS: ProjectSectionItem[] = [
  {
    title: "Personal Projects",
    type: "personal",
  },
  {
    title: "Open Source Projects",
    type: "open-source",
  },
  {
    title: "Assignments",
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
