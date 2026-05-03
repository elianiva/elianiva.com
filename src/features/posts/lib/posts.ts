import { createServerFn } from "@tanstack/react-start";
import { allPosts } from "content-collections";

export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
};

export const getPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<PostSummary[]> => {
    return allPosts
      .filter((p) => !p.draft)
      .sort((a, b) => (a.date > b.date ? -1 : 1))
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        tags: p.tags,
      }));
  },
);
