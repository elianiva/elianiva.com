import { Link } from "@tanstack/react-router";
import { Box, Cell, Fill, PageHead, STRETCHED, type Tone } from "~/components/box";
import { ProjectMark } from "./project-mark";
import { cn } from "~/lib/utils";
import type { ProjectType } from "~/features/content/lib/projects";
import { getProjects } from "../lib/projects";

const SECTIONS: { title: string; type: ProjectType; tone: Tone; blurb: string }[] = [
  { title: "Personal", type: "personal", tone: "yellow", blurb: "Things I build for myself" },
  {
    title: "Open source",
    type: "open-source",
    tone: "sky",
    blurb: "Built in the open, with others",
  },
  {
    title: "Assignments",
    type: "assignment",
    tone: "lilac",
    blurb: "Made for university and school",
  },
];

/**
 * Every project as a square compartment, grouped behind a coloured section
 * card that says how many sit in the group, most recently pushed first. Each
 * label shows the year of its last push. Numbering runs across the page.
 */
export function ProjectsPage({ activity }: { activity: Record<string, string> }) {
  // Most recently pushed first; a project off GitHub counts from its own date.
  const lastActive = (p: { slug: string; date: string }) => activity[p.slug] ?? p.date;
  const groups = SECTIONS.map((s) => ({
    ...s,
    projects: getProjects({ type: s.type })
      .map((p) => ({ ...p, active: lastActive(p) }))
      .sort((a, b) => b.active.localeCompare(a.active)),
  }));
  const total = groups.reduce((sum, g) => sum + g.projects.length, 0);

  return (
    <Box head={0}>
      <PageHead
        title="Projects"
        tone="hot"
        kicker="Apps, tools, and experiments, from my first CRUD app to the ones I use every day."
        aside={
          <>
            <p className="mt-auto font-display text-7xl leading-none font-extrabold tabular-nums">
              {total}
            </p>
            <p className="font-mono text-[11px] opacity-85">projects · {groups.length} shelves</p>
          </>
        }
      />
      {groups.map((group) => (
        <ProjectShelf key={group.type} group={group} />
      ))}
    </Box>
  );
}

function ProjectShelf({
  group,
}: {
  group: (typeof SECTIONS)[number] & {
    projects: (ReturnType<typeof getProjects>[number] & { active: string })[];
  };
}) {
  return (
    <>
      <Cell as="header" tone={group.tone} className="justify-between">
        {/* The shelf's three latest projects, fanned out like cards in a hand. */}
        <div aria-hidden className="flex pt-1 pl-1">
          {group.projects.slice(0, 3).map((project, i) => (
            <span
              key={project.slug}
              className={cn("-ml-3 first:ml-0", ["-rotate-6", "rotate-3", "rotate-12"][i])}
            >
              <ProjectMark slug={project.slug} title={project.title} />
            </span>
          ))}
        </div>
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-wide text-pink-950 uppercase">
            <span className="text-pink-500">{group.title[0]}</span>
            {group.title.slice(1)}
          </h2>
          <p className="text-sm text-pink-950/65">{group.blurb}</p>
        </div>
      </Cell>
      {group.projects.map((project) => (
        <Cell
          key={project.slug}
          as="article"
          linked
          label={
            <Link to="/projects/$slug" params={{ slug: project.slug }} className={STRETCHED}>
              <span suppressHydrationWarning>{project.active.slice(0, 4)}</span>
            </Link>
          }
        >
          <ProjectMark slug={project.slug} title={project.title} />
          <div className="mt-auto min-w-0">
            <h3 className="font-display text-lg leading-tight font-bold text-pink-950 transition-colors group-hover/cell:text-pink-600">
              {project.title}
            </h3>
            <p className="mt-1 line-clamp-3 text-sm leading-snug text-pink-950/65">
              {project.description}
            </p>
            <p className="mt-1.5 truncate font-mono text-[11px] text-pink-500">
              {project.stack
                .slice(0, 2)
                .map(([name]) => `#${name.toLowerCase().replace(/\s+/g, "-")}`)
                .join(" ")}
            </p>
          </div>
        </Cell>
      ))}
      <Fill used={group.projects.length + 1} />
    </>
  );
}
