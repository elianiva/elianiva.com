import type { Html as HtmlNs } from "@effect/ui/html";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { allProjects } from "virtual:content";
import { css } from "../../styled-system/css";
import { listProjects, type ProjectSummary, type ProjectType } from "../lib/projects";
import { seoHead, ogPageImageUrl } from "../lib/seo";
import { Box, Cell, stretched, type Tone } from "../ui/box";
import { Fill, PageHead } from "../ui/pagehead";
import { ProjectMark } from "../ui/project-mark";

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

type Group = (typeof SECTIONS)[number] & { projects: ProjectSummary[] };

const ProjectShelf = <M>(h: HtmlNs.H<M>, group: Group) => [
  Cell(h, {
    as: "header",
    tone: group.tone,
    style: css.raw({ justifyContent: "space-between" }),
    children: [
      // The shelf's three latest projects, fanned out like cards in a hand.
      h.div
        .attr("aria-hidden", "true")
        .class(css({ display: "flex", pt: "1", pl: "1" }))
        .children(
          group.projects.slice(0, 3).map((project, i) =>
            h.span
              .key(project.slug)
              .class(
                css({ ml: "-3", _first: { ml: "0" } }),
                i === 0
                  ? css({ rotate: "-6deg" })
                  : i === 1
                    ? css({ rotate: "3deg" })
                    : css({ rotate: "12deg" }),
              )
              .children(ProjectMark(h, { slug: project.slug, title: project.title })),
          ),
        ),
      h.div.children(
        h.h2
          .class(
            css({
              fontFamily: "display",
              fz: "2xl",
              fontWeight: "extrabold",
              letterSpacing: "wide",
              color: "pink.950",
              textTransform: "uppercase",
            }),
          )
          .children(
            h.span.class(css({ color: "pink.500" })).children(group.title[0] ?? ""),
            group.title.slice(1),
          ),
        h.p.class(css({ fz: "sm", color: "pink.950/65" })).children(group.blurb),
      ),
    ],
  }),
  ...group.projects.map((project) =>
    Cell(h, {
      as: "article",
      linked: true,
      label: h.a
        .attr("href", `/projects/${project.slug}`)
        .class(css(stretched))
        .children(project.date.slice(0, 4)),
      style: css.raw({ "&:hover .project-title": { color: "pink.600" } }),
      children: [
        ProjectMark(h, { slug: project.slug, title: project.title }),
        h.div.class(css({ mt: "auto", minWidth: "0" })).children(
          h.h3
            .class(
              "project-title",
              css({
                fontFamily: "display",
                fz: "lg",
                lineHeight: "tight",
                fontWeight: "bold",
                color: "pink.950",
                transition: "color 150ms",
              }),
            )
            .children(project.title),
          h.p
            .class(
              css({
                mt: "1",
                lineClamp: 3,
                fz: "sm",
                lineHeight: "snug",
                color: "pink.950/65",
              }),
            )
            .children(project.description),
          h.p
            .class(
              css({
                mt: "1.5",
                truncate: true,
                fontFamily: "mono",
                fontSize: "11px",
                color: "pink.500",
              }),
            )
            .children(
              project.stack
                .slice(0, 2)
                .map(([name]) => `#${name.toLowerCase().replace(/\s+/g, "-")}`)
                .join(" "),
            ),
        ),
      ],
    }).key(project.slug),
  ),
  ...Fill(h, group.projects.length + 1),
];

/**
 * Every project as a square compartment, grouped behind a coloured section
 * card that says how many sit in the group, newest first. Each label shows
 * the year of the project. Numbering runs across the page.
 *
 * The old page ordered by GitHub push activity read at build time; this one
 * orders by the project's own date.
 */
export const Projects = Html.component({
  name: "Projects",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  head: () => [
    ...seoHead({
      title: "Projects",
      description: "Things I've built",
      ogImage: ogPageImageUrl("projects"),
      path: "/projects",
    }),
  ],
  view: (h) => {
    const groups: Group[] = SECTIONS.map((s) => ({
      ...s,
      projects: listProjects(allProjects, { type: s.type }),
    }));
    const total = groups.reduce((sum, g) => sum + g.projects.length, 0);
    return Box(h, { head: 0 }).children(
      PageHead(h, {
        title: "Projects",
        tone: "hot",
        kicker: [
          "Apps, tools, and experiments, from my first CRUD app to the ones I use every day.",
        ],
        aside: [
          h.p
            .class(
              css({
                mt: "auto",
                fontFamily: "display",
                fz: "7xl",
                lineHeight: "none",
                fontWeight: "extrabold",
                fontVariantNumeric: "tabular-nums",
              }),
            )
            .children(String(total)),
          h.p
            .class(css({ fontFamily: "mono", fontSize: "11px", opacity: 0.85 }))
            .children(`projects · ${groups.length} shelves`),
        ],
      }),
      groups.flatMap((group) => ProjectShelf(h, group)),
    );
  },
});
