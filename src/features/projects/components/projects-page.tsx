import { BackButton } from "~/components/back-button";
import { ProjectSection } from "./project-section";

export function ProjectsPage() {
  return (
    <div className="mx-auto max-w-container pt-20 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <BackButton />
        <ProjectSection
          title="Open Source Projects"
          description="These are some open source projects I've helped building"
          type="open-source"
          featured={false}
        />
        <ProjectSection
          title="Personal Projects"
          description="Mostly made them just for fun and to learn new things."
          type="personal"
          featured={false}
        />
        <ProjectSection
          title="Assignments"
          description="Projects I've worked on for university courses."
          type="assignment"
          featured={false}
        />
      </div>
    </div>
  );
}
