import { Component, Head, Query, View } from "@effect/ui";
import { Html, HtmlHead } from "@effect/ui/html";
import { Effect, Schema } from "effect";
import { AsyncResult } from "effect/reactivity";
import { allPosts, postBodies } from "virtual:content";
import { css } from "../../styled-system/css";
import { getPost } from "../lib/posts";
import { postSeoHead } from "../lib/seo";
import { Box, Cell, stretched } from "../ui/box";
import { Comments } from "../ui/comments";
import { Island } from "../islands/island";
import { Icon } from "../ui/icons";
import { LostPage } from "../ui/lost-page";
import { renderMarkdown } from "../ui/markdown";
import { Postmark } from "../ui/pagehead";
import { Contents, contentsOf } from "../ui/prose";
import { formatCount, formatUtcDate } from "../lib/date";

/**
 * The post's Markdown body, loaded as its own chunk. A Query, so the server
 * render waits for it and the prerendered HTML holds the whole post.
 */
class PostBody extends Query.Service<PostBody>()("posts/PostBody", {
  args: { slug: Schema.String },
  success: Schema.Unknown,
  staleTime: "Infinity",
}) {
  static readonly layer = this.toLayer(({ slug }) => {
    const load = postBodies[slug];
    return load ? Effect.promise(() => load().then((m) => m.default)) : Effect.succeed(undefined);
  });
}

const longDate = {
  format: (d: Date | string | number) =>
    formatUtcDate(d, { day: "numeric", month: "short", year: true }),
};

const PostNoDeps = Html.component({
  name: "Post",
  props: Schema.Struct({ slug: Schema.String, islands: Schema.optional(Schema.Boolean) }),
  model: Schema.Struct({}),
  message: Schema.Never,
  queries: { body: { query: PostBody, args: ({ props }) => ({ slug: props.slug }) } },
}).make({
  init: () => ({}),
  update: ($) => $.model,
  head: ({ props }) => {
    const detail = getPost(allPosts, props.slug);
    // Hidden or unknown slugs render the 404 page; there is no post to describe.
    return detail
      ? postSeoHead({ ...detail.post })
      : [Head.title("Post not found"), HtmlHead.meta({ name: "robots", content: "noindex" })];
  },
  view: (h) => {
    const detail = getPost(allPosts, h.props.slug);
    if (!detail) return LostPage(h, { section: "post", home: "/posts" });
    const { post } = detail;
    const meta = { fontFamily: "mono", fontSize: "11px" } as const;
    const neighbours = [
      { dir: "Previous", post: detail.prevPost },
      { dir: "Next", post: detail.nextPost },
    ] as const;

    return Box(h, { square: false }).children(
      Cell(h, {
        as: "header",
        span: "w3",
        tone: "white",
        label: View.text("Post"),
        style: css.raw({ gap: "4", py: "8", md: { p: "10" } }),
        children: [
          h.h1
            .class(
              css({
                fontFamily: "display",
                fz: "4xl",
                lineHeight: "1.05",
                fontWeight: "extrabold",
                color: "pink.950",
                textWrap: "balance",
                md: { fz: "6xl", lineHeight: "1.05" },
              }),
            )
            .children(post.title),
          h.p
            .class(css({ maxWidth: "56ch", fz: "lg", color: "pink.950/70", textWrap: "pretty" }))
            .children(post.description),
        ],
      }),
      Cell(h, {
        as: "aside",
        tone: "yellow",
        style: css.raw({
          gridColumn: { base: "span 2", md: "span 1" },
          justifyContent: "space-between",
          gap: "5",
        }),
        children: [
          Postmark(h, {
            style: css.raw({ width: "24", height: "24", alignSelf: "flex-end", fontSize: "11px" }),
            children: [h.text(longDate.format(new Date(post.date)))],
          }),
          h.dl
            .class(
              css(meta, {
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                rowGap: "1",
                color: "pink.950/65",
              }),
            )
            .children(
              h.dt.children("read"),
              h.dd
                .class(css({ textAlign: "right", color: "pink.950" }))
                .children(`${detail.readingTime} min`),
              h.dt.children("words"),
              h.dd
                .class(css({ textAlign: "right", color: "pink.950" }))
                .children(formatCount(detail.wordCount)),
            ),
          h.p
            .class(css(meta, { color: "pink.600" }))
            .children(post.tags.map((t) => `#${t}`).join(" ")),
          h.a
            .attrs({
              href: `https://github.com/elianiva/elianiva.com/blob/master/app/content/posts/${post.slug}.md`,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": "Suggest an edit to this post on GitHub",
            })
            .class(
              css(meta, {
                display: "inline-flex",
                alignItems: "center",
                gap: "1.5",
                letterSpacing: "wider",
                textTransform: "uppercase",
                color: "pink.950/70",
                _hover: { color: "pink.600" },
              }),
            )
            .children(
              Icon(h, "note-pencil", { className: css({ width: "3.5", height: "3.5" }) }),
              "Suggest an edit",
            ),
        ],
      }),
      Cell(h, {
        as: "div",
        span: "w3",
        style: css.raw({ p: "4", py: "8", md: { p: "10" } }),
        children: [
          h.article
            .attr("id", "post-body")
            .class(
              css({ mx: "auto", width: "100%", maxWidth: "66ch", fontFamily: "body" }),
              "prose",
            )
            .children(
              AsyncResult.match(h.queries.body, {
                onInitial: () => null,
                onFailure: () => null,
                onSuccess: ({ value }) =>
                  value === undefined
                    ? null
                    : renderMarkdown(h, value, { islands: h.props.islands === true }),
              }),
              h.props.islands === true
                ? Island(h, { name: "Comments", id: "comments", load: "visible" })
                : Comments(h, { key: "comments" }),
            ),
        ],
      }),
      Cell(h, {
        as: "aside",
        style: css.raw({ display: "none", md: { display: "flex" } }),
        children: [
          AsyncResult.match(h.queries.body, {
            onInitial: () => null,
            onFailure: () => null,
            onSuccess: ({ value }) =>
              value === undefined
                ? null
                : Contents(h, contentsOf((value as { blocks: never[] }).blocks)),
          }),
        ],
      }),
      neighbours.map(({ dir, post: other }) =>
        other
          ? Cell(h, {
              linked: true,
              span: "w2",
              tone: dir === "Next" ? "pink" : "paper",
              label: h.a.attr("href", `/posts/${other.slug}`).class(css(stretched)).children(dir),
              style: css.raw({
                xl: { gridColumn: "span 3" },
                ...(dir === "Next" ? { md: { alignItems: "flex-end", textAlign: "right" } } : {}),
              }),
              children: [
                h.p
                  .class(
                    css({
                      fontFamily: "display",
                      fz: "xl",
                      fontWeight: "bold",
                      color: "pink.950",
                      textWrap: "balance",
                    }),
                  )
                  .children(other.title),
              ],
            }).key(dir)
          : Cell(h, {
              span: "w2",
              tone: "hatch",
              style: css.raw({
                display: "none",
                md: { display: "flex" },
                xl: { gridColumn: "span 3" },
              }),
            }).key(dir),
      ),
    );
  },
});

export const Post = PostNoDeps.pipe(Component.provide(PostBody.layer));
