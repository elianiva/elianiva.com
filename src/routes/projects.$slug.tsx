import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { Box, Cell, STRETCHED } from "~/components/box";
import { LostPage } from "~/components/lost-page";
import { proseComponents } from "~/components/prose";
import { ProjectMark } from "~/features/projects/components/project-mark";
import { cn } from "~/lib/utils";
import { projectMdx, preloadProjectMdx } from "~/features/content/lib/mdx";
import { getProjectBySlug } from "~/features/projects/lib/projects";
import { projectSeo } from "~/lib/seo";
import GithubIcon from "~icons/ph/github-logo-duotone";
import GlobeIcon from "~icons/ph/globe-hemisphere-west-duotone";

export const Route = createFileRoute("/projects/$slug")({
  component: ProjectDetailPage,
  // Same crawl guarantee as the post page: the index only links real
  // projects, so prerender never hits this for a bogus slug.
  loader: async ({ params: { slug } }) => {
    const detail = getProjectBySlug(slug);
    if (!detail) throw notFound();
    await preloadProjectMdx(slug);
    return detail;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return projectSeo({
      title: loaderData.project.title,
      description: loaderData.project.description,
      date: loaderData.project.date,
      slug: loaderData.project.slug,
      stack: loaderData.project.stack,
      image: loaderData.project.image,
    });
  },
  notFoundComponent: ProjectNotFoundPage,
});

function ProjectNotFoundPage() {
  return <LostPage section="project" home="/projects" />;
}

/** The stack's logo, or its first letter when the logo file is missing. */
function StackLogo({ name }: { name: string }) {
  const [broken, setBroken] = useState(false);
  const file = name.toLowerCase().replace(/\s+/g, "-");
  return (
    <span className="grid size-10 shrink-0 place-items-center border border-pink-200 bg-white p-1.5 transition-transform duration-300 group-hover/stack:-rotate-6">
      {broken ? (
        <span className="font-display text-sm font-extrabold text-pink-500">{name[0]}</span>
      ) : (
        <img
          className={cn("size-full object-contain", file === "nextjs" && "invert")}
          src={`/assets/logo/${file}.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      )}
    </span>
  );
}

function ProjectDetailPage() {
  const detail = Route.useLoaderData();
  const { project } = detail;
  const params = Route.useParams();
  // A component cannot be serialized into the prerender payload, so it is
  // resolved here and loaded lazily as its own chunk.
  const Mdx = projectMdx(params.slug);
  if (!Mdx) throw notFound();
  const neighbours = [
    { dir: "Previous", project: detail.prevProject },
    { dir: "Next", project: detail.nextProject },
  ];
  const buttons = [
    { label: "Source", href: project.source, Icon: GithubIcon },
    ...(project.demo ? [{ label: "Visit", href: project.demo, Icon: GlobeIcon }] : []),
  ];

  return (
    <Box square={false}>
      <Cell
        as="header"
        span="w3"
        tone="white"
        label={`Project · ${project.date.slice(0, 4)}`}
        className="gap-5 py-8 md:p-10"
      >
        <ProjectMark slug={project.slug} title={project.title} />
        <h1 className="font-display text-5xl leading-none font-extrabold tracking-wide text-pink-950 uppercase md:text-7xl">
          <span className="text-pink-500">{project.title[0]}</span>
          {project.title.slice(1)}
        </h1>
        <p className="max-w-[56ch] text-lg text-pink-950/70 text-pretty">{project.description}</p>
      </Cell>
      <Cell as="aside" tone="yellow" className="col-span-2 justify-end gap-2 md:col-span-1">
        {buttons.map(({ label, href, Icon }, i) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-between border px-3 py-2.5 font-mono text-xs tracking-wider uppercase transition-[color,background-color,border-color,box-shadow,transform,translate,rotate,scale] active:scale-[0.97] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(190,24,93,0.2)]",
              i === 0
                ? "border-pink-950 bg-pink-950 text-pink-50"
                : "border-pink-300 bg-white text-pink-950",
            )}
          >
            <span className="flex items-center gap-2">
              <Icon className="size-4" />
              {label}
            </span>
            ↗
          </a>
        ))}
      </Cell>

      {project.image && (
        <Cell span="w4" className="p-0">
          <img
            src={`/assets/projects/${project.slug}/${project.image}`}
            alt={project.title}
            className="block w-full bg-pink-100"
            loading="lazy"
            decoding="async"
          />
        </Cell>
      )}

      <Cell as="div" span="w3" className="p-4 py-8 md:p-10">
        <article className="prose prose-pink mx-auto w-full max-w-[66ch] font-body">
          <Suspense fallback={null}>
            <Mdx components={proseComponents} />
          </Suspense>
        </article>
      </Cell>
      <Cell as="aside" label="Built with" className="col-span-2 md:col-span-1">
        <ul className="grid gap-2 md:sticky md:top-6">
          {(project.stack || []).map(([name, homepage]) => (
            <li key={name}>
              <a
                href={homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="group/stack flex items-center gap-3 text-sm text-pink-950 hover:text-pink-600"
              >
                <StackLogo name={name} />
                {name}
              </a>
            </li>
          ))}
        </ul>
      </Cell>

      {neighbours.map(({ dir, project: other }) =>
        other ? (
          <Cell
            key={dir}
            linked
            span="w2"
            className="xl:col-span-3"
            tone={dir === "Next" ? "pink" : "paper"}
            label={
              <Link to="/projects/$slug" params={{ slug: other.slug }} className={STRETCHED}>
                {dir}
              </Link>
            }
          >
            <p className="font-display text-xl font-bold text-pink-950">{other.title}</p>
          </Cell>
        ) : (
          <Cell key={dir} span="w2" tone="hatch" className="hidden md:flex xl:col-span-3" />
        ),
      )}
    </Box>
  );
}
