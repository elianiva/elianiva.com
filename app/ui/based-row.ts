import { Component, Subscription, UiSchema, View } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Clock, Schedule, Schema, Stream } from "effect";
import { AsyncResult } from "effect/reactivity";
import { css } from "../../styled-system/css";
import { currentRoles } from "../data/work-experience";
import { allPosts, allProjects } from "virtual:content";
import { listPosts } from "../lib/posts";
import { listProjects } from "../lib/projects";
import type { GitHubActivity } from "../features/github/activity";
import { GetGitHubActivity } from "../queries/GetGitHubActivity";
import { Cell, type Style } from "./box";

const INLINE_LINK: Style = {
  color: "pink.800",
  textDecoration: "underline",
  textDecorationColor: "pink.300",
  textDecorationStyle: "dotted",
  textUnderlineOffset: "4px",
  transition: "color 150ms",
  _hover: { color: "pink.600", textDecorationStyle: "solid" },
};

export function timeAgo(from: string | number, now: number): string {
  const minutes = Math.max(0, Math.round((now - new Date(from).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/**
 * `null` in the prerender and the first client render, then the time of each
 * tick: one at mount and one every 30s. Subscriptions never run on the server.
 */
const ClockMessage = UiSchema.TaggedEnum({ Ticked: { now: Schema.Number } });
const ClockModel = Schema.Struct({ now: Schema.NullOr(Schema.Number) });

const ticks = Subscription.make(
  "clock",
  Stream.make(0).pipe(
    Stream.concat(Stream.fromSchedule(Schedule.spaced("30 seconds"))),
    Stream.mapEffect(() => Clock.currentTimeMillis),
    Stream.map((now) => ClockMessage.Ticked({ now })),
  ),
);

const clockUpdate = (message: typeof ClockMessage.Type): typeof ClockModel.Type => ({
  now: message.now,
});

const activityOf = (result: AsyncResult.AsyncResult<GitHubActivity, never>) =>
  AsyncResult.isSuccess(result) ? result.value : null;

const link = css(INLINE_LINK, { position: "relative", zIndex: "10" });

/** `#pushed repo 14h ago`. GitHub's events API is unauthenticated, so a rate limit just hides it. */
export const LastPushTagNoDeps = Html.component({
  name: "LastPushTag",
  props: Schema.Struct({}),
  model: ClockModel,
  message: ClockMessage,
  queries: { activity: { query: GetGitHubActivity, args: () => ({}) } },
}).make({
  init: () => ({ now: null }),
  update: (_$, message) => clockUpdate(message),
  subscriptions: () => [ticks],
  view: (h, { now }) => {
    const push = activityOf(h.queries.activity)?.push;
    if (now === null || !push) return h.span;
    return h.p.class(css({ fontFamily: "mono", fz: "xs", color: "pink.950/70" })).children(
      h.span.class(css({ color: "pink.400" })).children("#pushed"),
      " ",
      h.a
        .class(link)
        .attrs({
          href: `https://github.com/${push.repo}`,
          target: "_blank",
          rel: "noopener noreferrer",
        })
        .children(push.repo.split("/").pop() ?? ""),
      " ",
      timeAgo(push.at, now),
    );
  },
});
/** Mounted only in the browser: the prerender renders nothing here. */
export const LastPushTag = LastPushTagNoDeps.pipe(
  Component.provide(GetGitHubActivity.layer, { server: false }),
);

const ROW_LINK: Style = {
  position: "relative",
  zIndex: "10",
  minWidth: "0",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "pink.50",
  _hover: { color: "yellow.200" },
};
const MONO_LINK = css(ROW_LINK, { fontFamily: "mono", fontSize: "13px" });
const MONO_LINK_FIXED = css(ROW_LINK, { fontFamily: "mono", fontSize: "13px", flexShrink: "0" });
const PLAIN_LINK = css(ROW_LINK);
const PLAIN_LINK_FIXED = css(ROW_LINK, { flexShrink: "0" });
const DIM = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "pink.200/60",
});

/** One line of the board: a code on the left, what happened, and when. */
const BoardRow = <M, C extends ReadonlyArray<View.Content<M, any> | null | false | undefined>>(
  h: Html.H<M>,
  options: { code: string; when?: string | undefined },
  ...children: C
) =>
  h.li
    .key(options.code)
    .class(
      css({
        display: "grid",
        gridTemplateColumns: "4.5rem minmax(0, 1fr) auto",
        alignItems: "baseline",
        gap: "3",
        borderTopWidth: "1px",
        borderStyle: "dashed",
        borderColor: "pink.300/20",
        py: "1.5",
        _first: { borderTopWidth: "0" },
      }),
    )
    .children(
      h.span
        .class(
          css({
            fontFamily: "mono",
            fontSize: "9px",
            letterSpacing: "0.25em",
            color: "yellow.300",
            textTransform: "uppercase",
          }),
        )
        .children(options.code),
      h.span
        .class(css({ display: "flex", minWidth: "0", alignItems: "baseline", gap: "2", fz: "sm" }))
        .children(children),
      options.when
        ? h.span
            .class(
              css({
                flexShrink: "0",
                fontFamily: "mono",
                fontSize: "10px",
                color: "pink.300/70",
                fontVariantNumeric: "tabular-nums",
              }),
            )
            .children(options.when)
        : null,
    );

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const gh = (repo: string) => `https://github.com/${repo}`;
const last = (repo: string) => repo.split("/").pop() ?? repo;

/**
 * What I'm up to, as a board: the repos I pushed to this week, then one row
 * each for my job, my latest push and release on GitHub, my latest post, and
 * what I last played. The static rows are always there; the GitHub rows come
 * after mount, and when GitHub is unreachable they stay out.
 */
export const StatusBoard = <M>(
  h: Html.H<M>,
  options: { activity: GitHubActivity | null; now: number | null },
) => {
  const { activity, now } = options;
  const role = currentRoles()[0];
  const post = listPosts(allPosts, { limit: 1 })[0];
  const project = listProjects(allProjects)[0];
  const ago = (at: string | number) => (now === null ? undefined : timeAgo(at, now));

  return Cell(h, {
    tone: "dusk",
    label: View.text("Status"),
    style: {
      containerType: "inline-size",
      gridColumn: { base: "span 2", xl: "4 / 6" },
      gridRow: { xl: "1" },
    },
    children: [
      h.div.class(css({ display: "flex", flex: "1", flexDirection: "column", gap: "3" })).children(
        h.ul.class(css({ mt: "auto" })).children(
          activity && activity.recent.length > 0
            ? BoardRow(
                h,
                { code: "Recently", when: "this week" },
                h.span
                  .class(css({ display: "flex", minWidth: "0", flexWrap: "wrap", columnGap: "2" }))
                  .children(
                    activity.recent.slice(0, 3).map(({ repo, commits }) =>
                      h.a
                        .key(repo)
                        .class(MONO_LINK)
                        .attrs({ href: gh(repo), ...ext })
                        .children(
                          last(repo),
                          h.span
                            .class(css({ ml: "1", color: "pink.300/60" }))
                            .children(`×${commits}`),
                        ),
                    ),
                  ),
              )
            : null,
          role
            ? BoardRow(
                h,
                { code: "Work", when: role.time },
                h.a
                  .class(PLAIN_LINK)
                  .attrs(role.website?.href ? { href: role.website.href, ...ext } : ext)
                  .children(role.company),
                h.span.class(DIM).children(role.position),
              )
            : null,
          activity?.push
            ? BoardRow(
                h,
                { code: "Pushed", when: ago(activity.push.at) },
                h.a
                  .class(MONO_LINK_FIXED)
                  .attrs({ href: gh(activity.push.repo), ...ext })
                  .children(last(activity.push.repo)),
                activity.push.message ? h.span.class(DIM).children(activity.push.message) : null,
              )
            : null,
          activity?.release
            ? BoardRow(
                h,
                { code: "Shipped", when: ago(activity.release.at) },
                h.a
                  .class(MONO_LINK)
                  .attrs({
                    href: `${gh(activity.release.repo)}/releases/tag/${activity.release.tag}`,
                    ...ext,
                  })
                  .children(`${last(activity.release.repo)} ${activity.release.tag}`),
              )
            : null,
          activity?.pr
            ? BoardRow(
                h,
                { code: activity.pr.merged ? "Merged" : "Opened", when: ago(activity.pr.at) },
                h.a
                  .class(MONO_LINK_FIXED)
                  .attrs({ href: `${gh(activity.pr.repo)}/pull/${activity.pr.number}`, ...ext })
                  .children(`${last(activity.pr.repo)}#${activity.pr.number}`),
                h.span.class(DIM).children(activity.pr.title),
              )
            : null,
          project
            ? BoardRow(
                h,
                { code: "Built", when: ago(project.date) },
                h.a
                  .class(PLAIN_LINK_FIXED)
                  .attr("href", `/projects/${project.slug}`)
                  .children(project.title),
                h.span.class(DIM).children(project.description),
              )
            : null,
          post
            ? BoardRow(
                h,
                { code: "Wrote", when: ago(post.date) },
                h.a.class(PLAIN_LINK).attr("href", `/posts/${post.slug}`).children(post.title),
              )
            : null,
          activity?.starred
            ? BoardRow(
                h,
                { code: "Starred", when: ago(activity.starred.at) },
                h.a
                  .class(MONO_LINK)
                  .attrs({ href: gh(activity.starred.repo), ...ext })
                  .children(activity.starred.repo),
              )
            : null,
        ),
      ),
    ],
  });
};

/**
 * The live board. It reads GitHub's events and a clock, so it is kept off the
 * prerender, which shows `StatusBoard` without them (see `Home`'s fallback).
 */
export const StatusTileNoDeps = Html.component({
  name: "StatusTile",
  props: Schema.Struct({}),
  model: ClockModel,
  message: ClockMessage,
  queries: { activity: { query: GetGitHubActivity, args: () => ({}) } },
}).make({
  init: () => ({ now: null }),
  update: (_$, message) => clockUpdate(message),
  subscriptions: () => [ticks],
  view: (h, { now }) => StatusBoard(h, { activity: activityOf(h.queries.activity), now }),
});
export const StatusTile = StatusTileNoDeps.pipe(
  Component.provide(GetGitHubActivity.layer, { server: false }),
);
