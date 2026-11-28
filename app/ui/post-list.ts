import type { Html } from "@effect/ui/html";
import { css, cx } from "../../styled-system/css";
import type { PostSummary } from "../lib/posts";
import { Cell, stretched } from "./box";
import { Postmark } from "./pagehead";

const monthYear = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const matches = (post: PostSummary, query: string): boolean => {
  const q = query.toLowerCase();
  return (
    post.title.toLowerCase().includes(q) ||
    post.description.toLowerCase().includes(q) ||
    post.slug.toLowerCase().includes(q) ||
    post.tags.some((t) => t.toLowerCase().includes(q))
  );
};

/** One post as a compartment; the featured one is 2×2. */
export const PostCell = <M>(h: Html.H<M>, post: PostSummary, featured: boolean) =>
  Cell(h, {
    as: "article",
    linked: true,
    span: featured ? "s2" : "w2",
    tone: featured ? "graph" : "paper",
    style: { "&:hover .post-title": { color: "pink.600" } },
    label: h.a
      .attr("href", `/posts/${post.slug}`)
      .class(css(stretched))
      .children(monthYear.format(new Date(post.date))),
    children: [
      featured
        ? Postmark(h, {
            style: {
              position: "absolute",
              top: "12",
              right: "6",
              width: "20",
              height: "20",
              fontSize: "10px",
            },
            children: [h.text("latest post")],
          })
        : null,
      h.div
        .class(css({ mt: "auto", minWidth: "0" }), featured && css({ maxWidth: "85%" }))
        .children(
          h.h3
            .class(
              "post-title",
              cx(
                css({
                  fontFamily: "display",
                  lineHeight: "1.1",
                  fontWeight: "extrabold",
                  color: "pink.950",
                  textWrap: "balance",
                  transition: "color 150ms",
                }),
                featured ? css({ fz: "4xl", md: { fz: "5xl" } }) : css({ fz: "2xl" }),
              ),
            )
            .children(post.title),
          h.p
            .class(
              css({ mt: "2", color: "pink.950/65", textWrap: "pretty" }),
              featured ? css({ fz: "base", md: { fz: "lg" } }) : css({ lineClamp: 2, fz: "sm" }),
            )
            .children(post.description),
          h.p
            .class(css({ mt: "2", fontFamily: "mono", fontSize: "11px", color: "pink.500" }))
            .children(post.tags.map((t) => `#${t}`).join(" ")),
        ),
    ],
  }).key(post.slug);
