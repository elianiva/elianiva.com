import { createFileRoute, Link } from "@tanstack/react-router";
import { getProjectBySlug } from "~/features/projects/lib/projects";
import { projectSeo } from "~/lib/seo";
import { ProjectDetailSkeleton } from "~/components/ui/page-skeleton";
import GithubIcon from "~icons/ph/github-logo-duotone";
import GlobeIcon from "~icons/ph/globe-hemisphere-west-duotone";
import { Heading } from "~/components/ui/heading";

export const Route = createFileRoute("/projects/$slug")({
  component: ProjectDetailPage,
  pendingComponent: ProjectDetailSkeleton,
  loader: ({ params: { slug } }) => getProjectBySlug({ data: slug }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return projectSeo({
      title: loaderData.title,
      description: loaderData.description,
      date: loaderData.date,
      slug: loaderData.slug,
      stack: loaderData.stack,
      image: loaderData.image,
    });
  },
  notFoundComponent: ProjectNotFoundPage,
});

function ProjectNotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-container items-center justify-center px-4 py-16">
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
  const project = Route.useLoaderData();

  return (
    <>
      <main
        className="mx-auto max-w-container px-2 md:px-4 py-10 border-x border-pink-200/50 h-full"
        style={{ viewTransitionName: `project-card-${project.slug}` }}
      >
        <section
          className="grid grid-cols-1 md:grid-cols-[2.5fr_1fr] gap-4 pt-6"
          style={{ viewTransitionName: `project-content-${project.slug}` }}
        >
          <div className="space-y-4">
            {project.image && (
              <div className="overflow-hidden border-[0.5px] border-pink-200/50">
                <img
                  src={`/assets/projects/${project.slug}/${project.image}`}
                  alt={project.title}
                  className="block w-full h-full bg-pink-100"
                  loading="lazy"
                />
              </div>
            )}

            <div>
              <div className="relative flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-pink-200/50">
                <Heading level={1}>{project.title}</Heading>
                <div className="flex gap-2">
                  <a
                    className="flex gap-2 items-center bg-white/60 hover:bg-white border-[0.5px] border-pink-200/50 hover:border-pink-200 py-2 px-4 text-pink-950 hover:text-pink-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
                    href={project.source}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon className="size-5" />
                    <span className="text-sm font-mono uppercase">Source</span>
                  </a>
                  {project.demo !== null && project.demo !== undefined && (
                    <a
                      className="flex gap-2 items-center bg-pink-50/80 hover:bg-pink-50 border-[0.5px] border-pink-200/50 hover:border-pink-200 py-2 px-4 text-pink-950 hover:text-pink-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GlobeIcon className="size-5" />
                      <span className="text-sm font-mono uppercase">Visit</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="prose prose-pink max-w-full">{project.mdx}</div>
            </div>
          </div>

          <aside className="h-fit">
            <div>
              <Heading level={2}>Tech Stack</Heading>
              <div className="space-y-3 pt-4">
                {(project.stack || []).map(([stackName, stackHomepage]) => (
                  <div key={stackName} className="flex items-center gap-3 group">
                    <div className="flex items-center justify-center p-2 bg-pink-50/80 border-[0.5px] border-pink-200/50 size-12 shrink-0">
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

        <nav className="mt-12 pt-6 border-t border-pink-200/50">
          <div className="grid grid-cols-2 gap-4">
            {project.prevProject ? (
              <Link
                to="/projects/$slug"
                params={{ slug: project.prevProject.slug }}
                className="group flex flex-col bg-white/60 p-4 hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
              >
                <span className="text-xs font-mono text-pink-950/50 uppercase tracking-wider">
                  Previous
                </span>
                <span className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors line-clamp-2">
                  {project.prevProject.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {project.nextProject ? (
              <Link
                to="/projects/$slug"
                params={{ slug: project.nextProject.slug }}
                className="group flex flex-col items-end text-right bg-white/60 p-4 hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
              >
                <span className="text-xs font-mono text-pink-950/50 uppercase tracking-wider">
                  Next
                </span>
                <span className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors line-clamp-2">
                  {project.nextProject.title}
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
