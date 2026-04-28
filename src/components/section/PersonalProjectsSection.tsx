import { ProjectSection } from "~/components/section/ProjectSection";

interface Project {
  slug: string;
  title: string;
  description: string;
  date: string;
  hasImage?: boolean;
  stack?: [string, string][];
}

interface PersonalProjectsSectionProps {
  projects: Project[];
}

export function PersonalProjectsSection({ projects }: PersonalProjectsSectionProps) {
  return (
    <ProjectSection
      title="Personal Projects"
      description="These are some of my personal projects that I made in the past. Some of them are still in use, some are not. Mostly made them just for fun and to learn new things!"
      projects={projects}
      seeMoreUrl="/projects"
    />
  );
}
