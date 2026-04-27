import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { allProjects } from "content-collections";
import { MDXContent } from "@content-collections/mdx/react";
import { BackButton } from "#/components/BackButton";
import { SEO } from "#/components/SEO";
import sites from "#/data/sites";
import GithubIcon from "~icons/ph/github-logo-duotone";
import GlobeIcon from "~icons/ph/globe-hemisphere-west-duotone";

export const Route = createFileRoute("/projects/$slug")({
  component: ProjectDetailPage,
  loader: async ({ params }) => {
    const project = allProjects.find((p) => p.slug === params.slug);
    if (!project) {
      throw notFound();
    }

    const sortedProjects = allProjects.sort((a, b) => (a.date > b.date ? -1 : 1));
    const currentIndex = sortedProjects.findIndex((p) => p.slug === params.slug);
    const prevProject = sortedProjects[currentIndex + 1] || null;
    const nextProject = sortedProjects[currentIndex - 1] || null;

    return { project, prevProject, nextProject };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.project.title ?? "Project"} | elianiva's home row` },
      { name: "description", content: loaderData?.project.description ?? sites.description },
      { property: "og:title", content: loaderData?.project.title ?? "Project" },
      { property: "og:description", content: loaderData?.project.description ?? sites.description },
    ],
  }),
  notFoundComponent: ProjectNotFoundPage,
});

function ProjectNotFoundPage() {
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

function ProjectDetailPage() {
  const { project, prevProject, nextProject } = Route.useLoaderData();

  const thumbnail = `${sites.siteUrl}/assets/projects/${project.slug}/cover.webp`;

  return (
    <>
      <SEO title={project.title} description={project.description} thumbnail={thumbnail} />
      <main
        className="mx-auto max-w-[1080px] px-2 md:px-4 py-10 border-x border-pink-200/50"
        style={{ viewTransitionName: `project-card-${project.slug}` }}
      >
        <BackButton />

        <section
          className="grid grid-cols-1 md:grid-cols-[2.5fr_1fr] gap-4 pt-6"
          style={{ viewTransitionName: `project-content-${project.slug}` }}
        >
          <div className="space-y-4">
            {project.hasImage && (
              <div className="overflow-hidden border-[0.5px] border-pink-200/50">
                <img
                  src={`/assets/projects/${project.slug}/cover.webp`}
                  alt={project.title}
                  className="block w-full h-full bg-pink-100"
                  loading="lazy"
                />
              </div>
            )}

            <div>
              <div className="relative flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-4 border-pink-200/50 with-box-underline after:-translate-x-[700px]!">
                <h1 className="text-2xl font-bold font-display text-pink-950 tracking-wide">
                  {project.title}
                </h1>
                <div className="flex gap-2">
                  <a
                    className="flex gap-2 items-center bg-white/60 hover:bg-white border-[0.5px] border-pink-200/50 hover:border-pink-200 py-2 px-4 text-pink-950 hover:text-pink-800 transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
                    href={project.source}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon className="w-5 h-5" />
                    <span className="text-sm font-mono uppercase">Source</span>
                  </a>
                  {project.demo !== null && project.demo !== undefined && (
                    <a
                      className="flex gap-2 items-center bg-pink-50/80 hover:bg-pink-50 border-[0.5px] border-pink-200/50 hover:border-pink-200 py-2 px-4 text-pink-950 hover:text-pink-800 transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GlobeIcon className="w-5 h-5" />
                      <span className="text-sm font-mono uppercase">Visit</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="prose prose-pink max-w-full pt-4">
                <MDXContent code={project.mdx} />
              </div>
            </div>
          </div>

          <aside className="h-fit">
            <div>
              <h2 className="text-xl font-bold font-display text-pink-950 tracking-wide pb-3 border-b border-pink-200/50">
                Tech Stack
              </h2>
              <div className="space-y-3 pt-4">
                {(project.stack || []).map(([stackName, stackHomepage]) => (
                  <div key={stackName} className="flex items-center gap-3 group">
                    <div className="flex items-center justify-center p-2 bg-pink-50/80 border-[0.5px] border-pink-200/50 w-12 h-12 shrink-0">
                      <img
                        className={`w-full h-full object-contain ${
                          stackName.toLowerCase() === "nextjs" ? "filter invert" : ""
                        }`}
                        src={`/assets/logo/${stackName.toLowerCase().replace(/\s+/g, "-")}.png`}
                        alt={stackName}
                      />
                    </div>
                    <a
                      href={stackHomepage}
                      className="text-sm font-body text-pink-950 hover:text-pink-700 transition-colors focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {stackName}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {/* Prev/Next navigation */}
        <nav className="mt-12 pt-6 border-t border-pink-200/50">
          <div className="grid grid-cols-2 gap-4">
            {prevProject ? (
              <Link
                to={`/projects/${prevProject.slug}` as any}
                className="group flex flex-col bg-white/60 p-4 hover:bg-white transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
              >
                <span className="text-xs font-mono text-pink-950/50 uppercase tracking-wider">
                  Previous
                </span>
                <span className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors line-clamp-2">
                  {prevProject.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {nextProject ? (
              <Link
                to={`/projects/${nextProject.slug}` as any}
                className="group flex flex-col items-end text-right bg-white/60 p-4 hover:bg-white transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
              >
                <span className="text-xs font-mono text-pink-950/50 uppercase tracking-wider">
                  Next
                </span>
                <span className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors line-clamp-2">
                  {nextProject.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </nav>
      </main>
    </>
  );
}
