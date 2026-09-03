import type { MDXContent } from "mdx/types";
import { byDateDesc, toNeighbour } from "./shared";

export type PostDoc = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  hidden: boolean;
  content: string;
  mdx: MDXContent;
};

export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
};

export type PostNeighbour = { slug: string; title: string };

export type PostDetail = {
  post: PostSummary;
  mdx: MDXContent;
  wordCount: number;
  readingTime: number;
  prevPost: PostNeighbour | null;
  nextPost: PostNeighbour | null;
};

function toSummary(p: PostDoc): PostSummary {
  return { slug: p.slug, title: p.title, description: p.description, date: p.date, tags: p.tags };
}

// Published = not hidden; filter before sort so the shared collection array is never mutated.
function publishedPosts(posts: PostDoc[]): PostDoc[] {
  return posts.filter((p) => !p.hidden).sort(byDateDesc);
}

export function listPosts(posts: PostDoc[], options?: { limit?: number }): PostSummary[] {
  const summaries = publishedPosts(posts).map(toSummary);
  return options?.limit ? summaries.slice(0, options.limit) : summaries;
}

export function getPost(posts: PostDoc[], slug: string): PostDetail | null {
  const sorted = publishedPosts(posts);
  const index = sorted.findIndex((p) => p.slug === slug);
  if (index === -1) return null;

  const post = sorted[index];
  const words = post.content.replace(/^(#+\s*)/gm, "").split(/\s+/);

  return {
    post: toSummary(post),
    mdx: post.mdx,
    wordCount: words.length,
    readingTime: Math.ceil(words.length / 200),
    prevPost: toNeighbour(sorted[index + 1]),
    nextPost: toNeighbour(sorted[index - 1]),
  };
}
