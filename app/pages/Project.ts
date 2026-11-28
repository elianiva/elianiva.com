import { Query, View } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Component } from "@effect/ui";
import { Effect, Schema } from "effect";
import { AsyncResult } from "effect/reactivity";
import { allProjects, logoFiles, projectBodies } from "virtual:content";
import { css } from "../../styled-system/css";
import { getProject, type ProjectDetail } from "../lib/projects";
import { projectSeoHead } from "../lib/seo";
import { Box, Cell, stretched, type Tone } from "../ui/box";
import { Icon, type IconName } from "../ui/icons";
import { LostPage } from "../ui/lost-page";
import { renderMarkdown } from "../ui/markdown";
import { ProjectMark } from "../ui/project-mark";

/** The project's Markdown body, loaded as its own chunk. */
class ProjectBody extends Query.Service<ProjectBody>()("projects/ProjectBody", {
  args: { slug: Schema.String },
  success: Schema.Unknown,
  staleTime: "1 hour",
}) {
  static readonly layer = this.toLayer(({ slug }) => {
    const load = projectBodies[slug];
    return load ? Effect.promise(() => load().then((m) => m.default)) : Effect.succeed(undefined);
  });
}

const ProjectNoDeps = Html.component({
  name: "Project",
  props: Schema.Struct({ slug: Schema.String }),
  model: Schema.Struct({}),
  message: Schema.Never,
  queries: { body: { query: ProjectBody, args: ({ props }) => ({ slug: props.slug }) } },
}).make({
  init: () => ({}),
  update: ($) => $.model,
  head: ({ props }) => {
    const detail = getProject(allProjects, props.slug);
    return detail
      ? projectSeoHead({
          title: detail.project.title,
          description: detail.project.description,
          date: detail.project.date,
          slug: detail.project.slug,
          stack: detail.project.stack,
          ...(detail.project.image === undefined ? {} : { image: detail.project.image }),
        })
      : [];
  },
  view: (h) => {
    const detail = getProject(allProjects, h.props.slug);
    if (!detail) return LostPage(h, { section: "project", home: "/projects" });
    const { project } = detail;

    const StackLogo = (name: string) => {
      const file = name.toLowerCase().replace(/\s+/g, "-");
      return h.span
        .class(
          css({
            display: "grid",
            width: "10",
            height: "10",
            flexShrink: "0",
            placeItems: "center",
            border: "1px solid",
            borderColor: "pink.200",
            bg: "white",
            p: "1.5",
            transition: "transform 300ms",
            "a:hover &": { rotate: "-6deg" },
          }),
        )
        .children(
          !logoFiles.includes(file)
            ? h.span.class("logo-letter").children(name[0] ?? "")
            : h.img
                .class(
                  css({ width: "100%", height: "100%", objectFit: "contain" }),
                  file === "nextjs" && css({ filter: "invert(1)" }),
                )
                .attrs({
                  src: `/assets/logo/${file}.webp`,
                  "data-logo": name[0] ?? "",
                  alt: "",
                  loading: "lazy",
                  decoding: "async",
                }),
        );
    };

    const buttons: { label: string; href: string; icon: IconName }[] = [
      { label: "Source", href: project.source, icon: "github-logo-duotone" },
      ...(project.demo
        ? [{ label: "Visit", href: project.demo, icon: "globe-hemisphere-west-duotone" as const }]
        : []),
    ];

    const sideProject = (dir: "Previous" | "Next", other: ProjectDetail["prevProject"]) =>
      other
        ? Cell(h, {
            linked: true,
            span: "w2",
            tone: (dir === "Next" ? "pink" : "paper") satisfies Tone,
            style: css.raw({ xl: { gridColumn: "span 3" } }),
            label: h.a.attr("href", `/projects/${other.slug}`).class(css(stretched)).children(dir),
            children: [
              h.p
                .class(
                  css({ fontFamily: "display", fz: "xl", fontWeight: "bold", color: "pink.950" }),
                )
                .children(other.title),
            ],
          })
        : Cell(h, {
            span: "w2",
            tone: "hatch",
            style: css.raw({ display: { base: "none", md: "flex" }, xl: { gridColumn: "span 3" } }),
          });

    return Box(h, { square: false }).children(
      Cell(h, {
        as: "header",
        span: "w3",
        tone: "white",
        label: View.text(`Project · ${project.date.slice(0, 4)}`),
        style: css.raw({ gap: "5", py: "8", md: { p: "10" } }),
        children: [
          ProjectMark(h, { slug: project.slug, title: project.title }),
          h.h1
            .class(
              css({
                fontFamily: "display",
                fz: "5xl",
                lineHeight: "none",
                fontWeight: "extrabold",
                letterSpacing: "wide",
                color: "pink.950",
                textTransform: "uppercase",
                md: { fz: "7xl", lineHeight: "none" },
              }),
            )
            .children(
              h.span.class(css({ color: "pink.500" })).children(project.title[0] ?? ""),
              project.title.slice(1),
            ),
          h.p
            .class(css({ maxWidth: "56ch", fz: "lg", color: "pink.950/70", textWrap: "pretty" }))
            .children(project.description),
        ],
      }),
      Cell(h, {
        as: "aside",
        tone: "yellow",
        style: css.raw({
          gridColumn: { base: "span 2", md: "span 1" },
          justifyContent: "flex-end",
          gap: "2",
        }),
        children: buttons.map(({ label, href, icon }, i) =>
          h.a
            .key(label)
            .attrs({ href, target: "_blank", rel: "noopener noreferrer" })
            .class(
              css(
                {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid",
                  px: "3",
                  py: "2.5",
                  fontFamily: "mono",
                  fz: "xs",
                  letterSpacing: "wider",
                  textTransform: "uppercase",
                  transition: "all 150ms",
                  _active: { scale: "0.97" },
                  _hover: { translate: "0 -2px", boxShadow: "0 3px 0 rgba(190,24,93,0.2)" },
                },
                i === 0
                  ? { borderColor: "pink.950", bg: "pink.950", color: "pink.50" }
                  : { borderColor: "pink.300", bg: "white", color: "pink.950" },
              ),
            )
            .children(
              h.span
                .class(css({ display: "flex", alignItems: "center", gap: "2" }))
                .children(Icon(h, icon, { className: css({ width: "4", height: "4" }) }), label),
              "↗",
            ),
        ),
      }),
      project.image
        ? Cell(h, {
            span: "w4",
            style: css.raw({ p: "0" }),
            children: [
              h.img
                .attrs({
                  src: `/assets/projects/${project.slug}/${project.image}`,
                  alt: project.title,
                  loading: "lazy",
                  decoding: "async",
                })
                .class(css({ display: "block", width: "100%", bg: "pink.100" })),
            ],
          })
        : null,
      Cell(h, {
        as: "div",
        span: "w3",
        style: css.raw({ p: "4", py: "8", md: { p: "10" } }),
        children: [
          h.article
            .class(
              css({ mx: "auto", width: "100%", maxWidth: "66ch", fontFamily: "body" }),
              "prose",
            )
            .children(
              AsyncResult.match(h.queries.body, {
                onInitial: () => null,
                onFailure: () => null,
                onSuccess: ({ value }) => (value === undefined ? null : renderMarkdown(h, value)),
              }),
            ),
        ],
      }),
      Cell(h, {
        as: "aside",
        label: View.text("Built with"),
        style: css.raw({ gridColumn: { base: "span 2", md: "span 1" } }),
        children: [
          h.ul
            .class(css({ display: "grid", gap: "2", md: { position: "sticky", top: "6" } }))
            .children(
              project.stack.map(([name, homepage]) =>
                h.li.key(name).children(
                  h.a
                    .attrs({ href: homepage, target: "_blank", rel: "noopener noreferrer" })
                    .class(
                      css({
                        display: "flex",
                        alignItems: "center",
                        gap: "3",
                        fz: "sm",
                        color: "pink.950",
                        _hover: { color: "pink.600" },
                      }),
                    )
                    .children(StackLogo(name), name),
                ),
              ),
            ),
        ],
      }),
      sideProject("Previous", detail.prevProject),
      sideProject("Next", detail.nextProject),
    );
  },
});

export const Project = ProjectNoDeps.pipe(Component.provide(ProjectBody.layer));
