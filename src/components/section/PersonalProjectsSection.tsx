import { allProjects } from "content-collections";
import { ProjectSection } from "#/components/section/ProjectSection";

const personalProjects = allProjects
  .filter((p) => p.type === "personal" && p.featured)
  .sort((a, b) => (a.date > b.date ? -1 : 1));

export function PersonalProjectsSection() {
  return (
    <ProjectSection
      title="Personal Projects"
      description="These are some of my personal projects that I made in the past. Some of them are still in use, some are not. Mostly made them just for fun and to learn new things!"
      projects={personalProjects}
      seeMoreUrl="/projects"
    />
  );
}
