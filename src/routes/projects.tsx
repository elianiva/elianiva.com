import { createFileRoute } from "@tanstack/react-router";
import { allProjects } from "content-collections";
import { BackButton } from "#/components/BackButton";
import { ProjectSection } from "#/components/section/ProjectSection";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  loader: async () => {
    const personalProjects = allProjects
      .filter((p) => p.type === "personal")
      .sort((a, b) => (a.date > b.date ? -1 : 1));

    const openSourceProjects = allProjects
      .filter((p) => p.type === "open-source")
      .sort((a, b) => (a.date > b.date ? -1 : 1));

    const assignmentProjects = allProjects
      .filter((p) => p.type === "assignment")
      .sort((a, b) => (a.date > b.date ? -1 : 1));

    return { personalProjects, openSourceProjects, assignmentProjects };
  },
  head: () => ({
    meta: [{ title: "Projects | elianiva's home row" }],
  }),
});

function ProjectsPage() {
  const { personalProjects, openSourceProjects, assignmentProjects } =
    Route.useLoaderData();

  return (
    <div className="mx-auto max-w-[1080px] pt-20 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <BackButton />
        <ProjectSection
          title="Open Source Projects"
          description="These are some open source projects I've helped building"
          projects={openSourceProjects}
        />
        <ProjectSection
          title="Personal Projects"
          description="These are some of my personal projects that I made in the past. Some of them are still in use, some are not. Mostly made them just for fun and to learn new things."
          projects={personalProjects}
        />
        <ProjectSection
          title="Assignment Projects"
          description="These are some projects that I did as an assignment whether it's from when I was in high school or university. Guess I'd put them here anyway in case someone find them useful."
          projects={assignmentProjects}
        />
      </div>
    </div>
  );
}
