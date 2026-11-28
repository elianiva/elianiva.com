import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { allPosts } from "virtual:content";
import { css } from "../../styled-system/css";
import { listPosts } from "../lib/posts";
import { ogPageImageUrl, seoHead } from "../lib/seo";
import { Box, Cell } from "../ui/box";
import { Icon } from "../ui/icons";
import { Fill, PageHead } from "../ui/pagehead";
import { matches, PostCell } from "../ui/post-list";

export const PostsMessage = UiSchema.TaggedEnum({
  Searched: { query: Schema.String },
  ClearedSearch: {},
  ToggledTag: { tag: Schema.String },
});

/** The archive: a search compartment with every tag as a toggle, then one compartment per post. */
export const Posts = Html.component({
  name: "Posts",
  props: Schema.Struct({}),
  model: Schema.Struct({ query: Schema.String, tags: Schema.Array(Schema.String) }),
  message: PostsMessage,
}).make({
  init: () => ({ query: "", tags: [] }),
  update: {
    Searched: ($, { query }) => $.evolve({ query }),
    ClearedSearch: ($) => $.evolve({ query: "" }),
    ToggledTag: ($, { tag }) =>
      $.evolve({
        tags: (tags) => (tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]),
      }),
  },
  head: () =>
    seoHead({
      title: "Posts",
      description: "All blog posts",
      ogImage: ogPageImageUrl("posts"),
      path: "/posts",
    }),
  view: (h, { query, tags }) => {
    const posts = listPosts(allPosts);
    const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();
    const filtered = posts.filter(
      (p) => tags.every((t) => p.tags.includes(t)) && (!query || matches(p, query)),
    );
    const filtering = query !== "" || tags.length > 0;
    // The featured post takes 4 cells, every other post 2.
    const used = filtered.length * 2 + (!filtering && filtered.length > 0 ? 2 : 0);

    return Box(h, { head: 1 }).children(
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
        style: { gap: "2.5", py: "3", md: { py: "4" } },
        children: [
          h.div.class(css({ position: "relative" })).children(
            h.input
              .attrs({
                type: "search",
                placeholder: "Type to search…",
                "aria-label": "Search posts",
              })
              .value(query)
              .on("input", ({ value }) => PostsMessage.Searched({ query: value }))
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
            query
              ? h.button
                  .attrs({ type: "button", "aria-label": "Clear search" })
                  .on("click", PostsMessage.ClearedSearch())
                  .class(
                    css({
                      position: "absolute",
                      top: "0.5",
                      right: "0",
                      color: "pink.400",
                      _hover: { color: "pink.600" },
                    }),
                  )
                  .children(Icon(h, "x", { className: css({ width: "5", height: "5" }) }))
              : null,
          ),
          h.ul
            .attr("aria-label", "Filter by tag")
            .class(css({ display: "flex", flexWrap: "wrap", gap: "1.5" }))
            .children(
              allTags.map((tag) => {
                const on = tags.includes(tag);
                return h.li.key(tag).children(
                  h.button
                    .attrs({ type: "button", "aria-pressed": on ? "true" : "false" })
                    .on("click", PostsMessage.ToggledTag({ tag }))
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
                      on
                        ? css({
                            rotate: "-3deg",
                            borderColor: "pink.600",
                            bg: "pink.600",
                            color: "white",
                          })
                        : css({
                            borderColor: "pink.200",
                            color: "pink.700",
                            _hover: { translate: "0 -2px", borderColor: "pink.400", bg: "white" },
                          }),
                    )
                    .children(`#${tag}`),
                );
              }),
            ),
          h.p
            .attr("aria-live", "polite")
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
            .children(filtering ? `${filtered.length} of ${posts.length} posts` : "\u00a0"),
        ],
      }),
      filtered.map((post, i) => PostCell(h, post, !filtering && i === 0)),
      filtered.length === 0
        ? Cell(h, {
            span: "w4",
            tone: "hatch",
            style: { alignItems: "center", justifyContent: "center", textAlign: "center" },
            children: [
              h.p
                .class(css({ fontFamily: "mono", fz: "sm", color: "pink.700" }))
                .children("No posts match that. Try fewer tags."),
            ],
          })
        : null,
      Fill(h, used),
    );
  },
});
