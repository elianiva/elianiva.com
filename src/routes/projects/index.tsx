import { createFileRoute, Link } from "@tanstack/react-router";
import { allProjects } from "content-collections";
import { BackButton } from "~/components/BackButton";
import { ProjectSection } from "~/components/section/ProjectSection";
import sites from "~/data/sites";

export const Route = createFileRoute("/projects/")({
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
  head: () => ({ meta: [{ title: "Projects | " + sites.siteName }] }),
  notFoundComponent: ProjectsNotFoundPage,
});

function ProjectsNotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1080px] items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl border border-pink-200 bg-white/80 p-6 shadow-soft backdrop-blur-sm md:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-pink-400">404 / projects</p>
        <h1 className="mt-3 text-3xl font-display text-pink-800 md:text-5xl">
          This project has not materialized.
        </h1>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-pink-950/75 md:text-base">
          The thing you were looking for is not here. Maybe check the project list again.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100"
          >
            Home
          </Link>
          <Link
            to="/projects"
            className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100"
          >
            Projects index
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProjectsPage() {
  const { personalProjects, openSourceProjects, assignmentProjects } = Route.useLoaderData();

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
