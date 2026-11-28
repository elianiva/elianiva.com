import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { allPosts } from "virtual:content";
import { css } from "../../styled-system/css";
import { listPosts } from "../lib/posts";
import { ogPageImageUrl, seoHead } from "../lib/seo";
import { Box, Cell } from "../ui/box";
import { Icon } from "../ui/icons";
import { Fill, PageHead } from "../ui/pagehead";
import { PostCell, postSearchText } from "../ui/post-list";
import type { PostSummary } from "../lib/posts";

/** What `app/posts-filter.ts` filters on, read from the cell instead of from the content. */
const postData = (post: PostSummary) => ({
  "data-post-tags": post.tags.join(" "),
  "data-post-text": postSearchText(post),
});

/** The archive: a search compartment with every tag as a toggle, then one compartment per post. */
export const Posts = Html.component({
  name: "Posts",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  head: () =>
    seoHead({
      title: "Posts",
      description: "All blog posts",
      ogImage: ogPageImageUrl("posts"),
      path: "/posts",
    }),
  view: (h) => {
    const posts = listPosts(allPosts);
    const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();
    // The featured post takes 4 cells, every other post 2.
    const used = posts.length * 2 + (posts.length > 0 ? 2 : 0);

    return Box(h, { head: 1 })
      .attr("data-posts-filter", "")
      .children(
        PageHead(h, {
          title: "Posts",
          tone: "sky",
          kicker: [h.text("Notes on editors, the web, Japanese, and the tools I keep rebuilding.")],
          aside: [
            h.p
              .class(
                css({
                  mt: "auto",
                  fontFamily: "display",
                  fz: "7xl",
                  lineHeight: "none",
                  fontWeight: "extrabold",
                  color: "pink.950",
                  fontVariantNumeric: "tabular-nums",
                }),
              )
              .children(String(posts.length).padStart(2, "0")),
            h.p
              .class(css({ fontFamily: "mono", fontSize: "11px", color: "pink.950/60" }))
              .children(`posts · ${allTags.length} tags`),
          ],
        }),
        Cell(h, {
          span: "w4",
          label: h.text("Find a post"),
          style: css.raw({ gap: "2.5", py: "3", md: { py: "4" } }),
          children: [
            h.div.class(css({ position: "relative" })).children(
              h.input
                .attrs({
                  type: "search",
                  placeholder: "Type to search…",
                  "aria-label": "Search posts",
                })
                .attr("data-posts-query", "")
                .class(
                  css({
                    width: "100%",
                    borderBottomWidth: "2px",
                    borderColor: "pink.200",
                    bg: "transparent",
                    pb: "1",
                    fontFamily: "display",
                    fz: "xl",
                    color: "pink.950",
                    md: { fz: "2xl" },
                    _placeholder: { color: "pink.950/30" },
                    _focus: { borderColor: "pink.500", outline: "none" },
                  }),
                ),
              h.button
                .attrs({ type: "button", "aria-label": "Clear search", "data-posts-clear": "" })
                .class(
                  css({
                    position: "absolute",
                    top: "0.5",
                    right: "0",
                    color: "pink.400",
                    _hover: { color: "pink.600" },
                  }),
                )
                .attr("hidden", "")
                .children(Icon(h, "x", { className: css({ width: "5", height: "5" }) })),
            ),
            h.ul
              .attr("aria-label", "Filter by tag")
              .class(css({ display: "flex", flexWrap: "wrap", gap: "1.5" }))
              .children(
                allTags.map((tag) => {
                  return h.li.key(tag).children(
                    h.button
                      .attrs({ type: "button", "aria-pressed": "false", "data-posts-tag": tag })
                      .class(
                        css({
                          borderWidth: "1px",
                          px: "2",
                          py: "0.5",
                          fontFamily: "mono",
                          fontSize: "11px",
                          transition: "all 200ms",
                          _active: { scale: "0.97" },
                        }),
                        css({
                          borderColor: "pink.200",
                          color: "pink.700",
                          _hover: { translate: "0 -2px", borderColor: "pink.400", bg: "white" },
                          "&[aria-pressed=true]": {
                            rotate: "-3deg",
                            borderColor: "pink.600",
                            bg: "pink.600",
                            color: "white",
                          },
                        }),
                      )
                      .children(`#${tag}`),
                  );
                }),
              ),
            h.p
              .attrs({ "aria-live": "polite", "data-posts-count": "" })
              .class(
                css({
                  position: "absolute",
                  top: "4",
                  right: "4",
                  fontFamily: "mono",
                  fontSize: "11px",
                  color: "pink.950/50",
                  md: { top: "5", right: "5" },
                }),
              )
              .children("\u00a0"),
          ],
        }),
        // The first post is drawn twice: featured while nothing is filtered, and as a
        // plain cell once a filter is on (`app/posts-filter.ts` swaps them).
        posts.flatMap((post, i) =>
          i === 0
            ? [
                PostCell(h, post, true).attr("data-post-featured", "").key(`${post.slug}-featured`),
                PostCell(h, post, false).attr("hidden", "").key(post.slug),
              ].map((cell) => cell.attrs(postData(post)))
            : [PostCell(h, post, false).attrs(postData(post))],
        ),
        Cell(h, {
          span: "w4",
          tone: "hatch",
          style: css.raw({ alignItems: "center", justifyContent: "center", textAlign: "center" }),
          children: [
            h.p
              .class(css({ fontFamily: "mono", fz: "sm", color: "pink.700" }))
              .children("No posts match that. Try fewer tags."),
          ],
        })
          .attr("data-posts-empty", "")
          .attr("hidden", ""),
        h.div
          .attr("data-posts-fill", "")
          .class(css({ display: "contents" }))
          .children(Fill(h, used)),
      );
  },
});
