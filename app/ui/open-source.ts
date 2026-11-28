import { Component } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { AsyncResult } from "effect/reactivity";
import { css } from "../../styled-system/css";
import { GetGitHubPrs } from "../queries/GetGitHubPrs";
import { Heading } from "./heading";
import { PRDropdown } from "./pr-dropdown";
import { Skeleton } from "./skeleton";

const list = css({ display: "flex", flexDirection: "column", gap: "1" });

/** The placeholder rows, as the prerender and the first browser render show them. */
export const OpenSourceSkeleton = <M>(h: Html.H<M>) =>
  h.div.class(list).children(
    Array.from({ length: 6 }, (_, i) =>
      Skeleton(h)
        .key(String(i))
        .class(css({ height: "10", width: "full" })),
    ),
  );

/**
 * Merged pull requests in other people's projects over the last year. They
 * come from the GitHub API in the browser: the prerender shows the skeleton.
 */
export const OpenSourceSectionNoDeps = Html.component({
  name: "OpenSourceSection",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
  queries: { prs: { query: GetGitHubPrs, args: () => ({}) } },
}).make({
  init: () => ({}),
  update: ($) => $.model,
  view: (h) => {
    const result = h.queries.prs;
    const body = AsyncResult.isSuccess(result)
      ? (() => {
          const { grouped, totalPRs } = result.value;
          const projects = grouped.length;
          if (projects === 0) {
            return h.div
              .class(
                css({
                  textAlign: "center",
                  py: "8",
                  border: "1px solid",
                  borderColor: "pink.200",
                  rounded: "lg",
                }),
              )
              .children(
                h.p
                  .class(css({ fz: "sm", fontFamily: "body", color: "pink.950/60" }))
                  .children("No merged pull requests from the last year to show."),
              );
          }
          return h.div.children(
            h.div
              .class(list)
              .children(
                grouped.map((group) =>
                  PRDropdown(h, { key: group.repository.full_name, props: { group } }),
                ),
              ),
            h.p
              .class(css({ pt: "3", fz: "xs", fontFamily: "mono", color: "pink.950/40" }))
              .children(
                `${totalPRs} merged pull request${totalPRs === 1 ? "" : "s"} across ${projects} project${projects === 1 ? "" : "s"}`,
              ),
          );
        })()
      : OpenSourceSkeleton(h);
    return h.section
      .attr("aria-labelledby", "open-source-heading")
      .class(css({ minWidth: "0" }))
      .children(
        h.div.children(
          Heading(h, { level: 2, children: ["Open Source Contributions"] }).id(
            "open-source-heading",
          ),
        ),
        h.div.children(
          h.p
            .class(
              css({
                fz: "xs",
                fontFamily: "body",
                color: "pink.950/70",
                pt: "2",
                pb: "4",
                md: { fz: "base" },
              }),
            )
            .children(
              "Merged pull requests in other people’s projects over the last year, most recent first.",
            ),
        ),
        body,
      );
  },
});
export const OpenSourceSection = OpenSourceSectionNoDeps.pipe(
  Component.provide(GetGitHubPrs.layer, { server: false }),
);
