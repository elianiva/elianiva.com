import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { css } from "../../styled-system/css";
import { RepositoryContributions } from "../features/github/types";
import { stretched } from "./box";
import { Icon } from "./icons";

const abbreviateNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${Math.round(num / 1_000)}k`;
  return num.toString();
};

/** Fixed to UTC so the server and the client always render the same month. */
const monthYear = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const PRDropdownMessage = UiSchema.TaggedEnum({ ToggledDetails: {} });

const stat = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "1",
  fontFamily: "mono",
  fz: "xs",
  color: "pink.950/70",
});

/** One repository's merged pull requests, folded until opened. */
export const PRDropdown = Html.component({
  name: "PRDropdown",
  props: Schema.Struct({ group: RepositoryContributions }),
  model: Schema.Struct({ open: Schema.Boolean }),
  message: PRDropdownMessage,
}).make({
  init: () => ({ open: false }),
  update: ($) => $.evolve({ open: (open) => !open }),
  view: (h, { open }) => {
    const { repository, prs, mergedCount, lastMergedAt } = h.props.group;
    const detailsId = `pr-details-${repository.full_name}`;
    return h.div
      .class(
        css({
          position: "relative",
          bg: "color-mix(in oklab, white 70%, transparent)",
          _hover: { bg: "white" },
        }),
      )
      .children(
        h.div
          .class(
            css({
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              px: "4",
              py: "3",
              smDown: { alignItems: "flex-start" },
              sm: { alignItems: "center" },
            }),
          )
          .children(
            h.div.class(css({ display: "flex", alignItems: "center", gap: "2" })).children(
              // The whole header is the toggle: the button's `::after` covers it.
              h.button
                .attrs({
                  type: "button",
                  "aria-expanded": String(open),
                  "aria-controls": detailsId,
                })
                .class(
                  css(stretched, {
                    cursor: "pointer",
                    color: "pink.600",
                    transition: "transform 200ms cubic-bezier(0, 0, 0.2, 1)",
                    _after: { cursor: "pointer" },
                  }),
                  open && css({ rotate: "180deg" }),
                )
                .on("click", PRDropdownMessage.ToggledDetails())
                .children(
                  h.span
                    .class(
                      css({
                        position: "absolute",
                        width: "1px",
                        height: "1px",
                        overflow: "hidden",
                        clip: "rect(0 0 0 0)",
                        whiteSpace: "nowrap",
                      }),
                    )
                    .children(`Pull requests in ${repository.full_name}`),
                  Icon(h, "caret-down", {
                    className: css({ display: "inline-block", width: "3", height: "3" }),
                  }),
                ),
              h.h3
                .class(css({ textAlign: "left", fontFamily: "mono", fz: "sm", color: "pink.800" }))
                .children(
                  h.a
                    .class(
                      css({
                        position: "relative",
                        zIndex: "10",
                        display: "inline-flex",
                        alignItems: "center",
                        color: "pink.800",
                        transition: "color 150ms",
                        _hover: { color: "pink.500" },
                      }),
                    )
                    .attrs({
                      href: `https://github.com/${repository.full_name}`,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })
                    .children(
                      h.span
                        .class(css({ display: { base: "none", sm: "inline" } }))
                        .children(repository.full_name),
                      h.span
                        .class(css({ display: { base: "inline", sm: "none" } }))
                        .children(repository.full_name.split("/").at(-1) ?? ""),
                      Icon(h, "arrow-up-right-duotone", {
                        className: css({ display: "inline-block", width: "3", height: "3" }),
                      }),
                    ),
                ),
            ),
            h.div.children(
              h.div
                .class(
                  css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "2",
                  }),
                )
                .children(
                  h.div.class(stat).children(
                    Icon(h, "git-pull-request-duotone", {
                      className: css({ width: "4", height: "4", color: "teal.500" }),
                    }),
                    h.span.class(css({ fontWeight: "bold" })).children(String(mergedCount)),
                  ),
                  h.div.class(stat).children(
                    Icon(h, "star-fill", {
                      className: css({ width: "3", height: "3", color: "yellow.400" }),
                    }),
                    h.span
                      .class(css({ fontWeight: "bold" }))
                      .children(abbreviateNumber(repository.stargazerCount)),
                  ),
                ),
              h.p
                .class(
                  css({
                    fontFamily: "mono",
                    fz: "xs",
                    color: "pink.950/50",
                    mt: "1",
                    textAlign: "right",
                  }),
                )
                .children(`last merged ${monthYear.format(new Date(lastMergedAt))}`),
            ),
          ),
        open
          ? h.div.class(css({ borderTopWidth: "1px", borderColor: "pink.200/50" })).children(
              h.div
                .id(detailsId)
                .class(css({ p: "3" }))
                .children(
                  h.div.class(css({ display: "flex", flexDirection: "column", gap: "2" })).children(
                    prs.map((pr) =>
                      h.div
                        .key(pr.id)
                        .class(
                          css({
                            borderColor: "pink.200/50",
                            "&:not(:last-child)": { borderBottomWidth: "1px", pb: "2" },
                          }),
                        )
                        .children(
                          h.div
                            .class(
                              css({
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: "3",
                              }),
                            )
                            .children(
                              h.div.class(css({ flex: "1", minWidth: "0" })).children(
                                h.a
                                  .class(
                                    css({
                                      lineClamp: "2",
                                      overflow: "hidden",
                                      fontFamily: "body",
                                      fz: "sm",
                                      fontWeight: "medium",
                                      color: "pink.950",
                                      transition: "color 150ms",
                                      _hover: { color: "pink.700" },
                                    }),
                                  )
                                  .attrs({
                                    href: pr.url,
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                  })
                                  .children(pr.title),
                                h.p
                                  .class(
                                    css({
                                      fontFamily: "mono",
                                      fz: "xs",
                                      color: "pink.950/50",
                                      mt: "1",
                                    }),
                                  )
                                  .children(
                                    `#${pr.number} • merged ${pr.merged_at ? new Date(pr.merged_at).toLocaleDateString("en-GB") : ""}`,
                                  ),
                              ),
                              h.div
                                .class(
                                  css({
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: "1",
                                    fz: "xs",
                                    fontFamily: "mono",
                                    color: "pink.950/70",
                                  }),
                                )
                                .children(
                                  h.div
                                    .class(css({ display: "flex", alignItems: "center", gap: "1" }))
                                    .children(
                                      h.span
                                        .class(css({ color: "green.600" }))
                                        .children(`+${pr.additions}`),
                                      h.span
                                        .class(css({ color: "red.600" }))
                                        .children(`-${pr.deletions}`),
                                    ),
                                  h.div
                                    .class(css({ color: "pink.950/50" }))
                                    .children(
                                      `${pr.changed_files} file${pr.changed_files !== 1 ? "s" : ""}`,
                                    ),
                                ),
                            ),
                        ),
                    ),
                  ),
                ),
            )
          : null,
      );
  },
});
