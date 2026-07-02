import { createServerFn } from "@tanstack/react-start";
import { allPosts } from "content-collections";

export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
};

export const getPosts = createServerFn({ method: "GET" })
  .inputValidator((input: { limit?: number }) => input)
  .handler(async ({ data }) => {
    let posts = allPosts
      .filter((p) => !p.hidden)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        tags: p.tags,
      }));

    if (data?.limit) {
      posts = posts.slice(0, data.limit);
    }

    return posts;
  });
