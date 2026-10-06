import { allPosts } from "content-collections";
import { getPost, listPosts } from "~/features/content/lib/posts";

/**
 * Client reads over the bundled content collection. Posts ship in the JS
 * bundle, so these are synchronous — no fetcher, no server round-trip.
 */
export function getPosts(options?: { limit?: number }) {
  return listPosts(allPosts, options);
}

export function getPostBySlug(slug: string) {
  return getPost(allPosts, slug);
}
