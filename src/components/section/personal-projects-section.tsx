import { ProjectSection } from "~/components/section/project-section";

export function PersonalProjectsSection() {
  return (
    <ProjectSection
      title="Personal Projects"
      description="These are some of my personal projects that I made in the past. Some of them are still in use, some are not. Mostly made them just for fun and to learn new things!"
      type="personal"
      featured
      seeMoreUrl="/projects"
    />
  );
}
