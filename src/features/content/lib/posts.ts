import { byDateDesc, toNeighbour } from "./shared";

export type PostDoc = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  hidden: boolean;
  wordCount: number;
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
  return {
    post: toSummary(post),
    wordCount: post.wordCount,
    readingTime: Math.ceil(post.wordCount / 200),
    prevPost: toNeighbour(sorted[index + 1]),
    nextPost: toNeighbour(sorted[index - 1]),
  };
}
