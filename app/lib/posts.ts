import type { Post } from "virtual:content";

/** What a post card needs. */
export type PostSummary = Pick<Post, "slug" | "title" | "description" | "date" | "tags">;

export type PostNeighbour = { slug: string; title: string };

export type PostDetail = {
  post: PostSummary;
  wordCount: number;
  readingTime: number;
  prevPost: PostNeighbour | null;
  nextPost: PostNeighbour | null;
};

const toSummary = (p: Post): PostSummary => ({
  slug: p.slug,
  title: p.title,
  description: p.description,
  date: p.date,
  tags: p.tags,
});

const toNeighbour = (p: Post | undefined): PostNeighbour | null =>
  p ? { slug: p.slug, title: p.title } : null;

// Published = not hidden; filter before sort so the shared collection array is never mutated.
const publishedPosts = (posts: readonly Post[]): Post[] =>
  posts.filter((p) => !p.hidden).sort((a, b) => b.date.localeCompare(a.date));

/** The published posts, newest first. */
export function listPosts(posts: readonly Post[], options?: { limit?: number }): PostSummary[] {
  const summaries = publishedPosts(posts).map(toSummary);
  return options?.limit ? summaries.slice(0, options.limit) : summaries;
}

/** One published post with its reading time and its neighbours (newer = next, older = previous). */
export function getPost(posts: readonly Post[], slug: string): PostDetail | null {
  const sorted = publishedPosts(posts);
  const index = sorted.findIndex((p) => p.slug === slug);
  const post = sorted[index];
  if (!post) return null;

  return {
    post: toSummary(post),
    wordCount: post.wordCount,
    readingTime: Math.ceil(post.wordCount / 200),
    prevPost: toNeighbour(sorted[index + 1]),
    nextPost: toNeighbour(sorted[index - 1]),
  };
}
