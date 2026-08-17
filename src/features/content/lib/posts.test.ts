import { describe, expect, it } from "vite-plus/test";
import { listPosts, getPost, type PostDoc } from "./posts";
import type { MDXContent } from "mdx/types";

const mdx = (() => null) as unknown as MDXContent;

function makePost(overrides: Partial<PostDoc> = {}): PostDoc {
  return {
    slug: "test-post",
    title: "Test",
    description: "desc",
    date: "2024-06-01",
    tags: ["react"],
    hidden: false,
    content: "## Hello world\n\nSome content here.",
    mdx,
    ...overrides,
  };
}

const posts = [
  makePost({ slug: "b", date: "2024-01-15", title: "Middle" }),
  makePost({ slug: "a", date: "2024-06-01", title: "New" }),
  makePost({ slug: "c", date: "2023-12-01", title: "Old" }),
  makePost({ slug: "hidden-post", hidden: true, title: "Hidden", date: "2025-01-01" }),
];

describe("listPosts", () => {
  it("returns only published posts, newest first", () => {
    const result = listPosts(posts);
    expect(result).toHaveLength(3);
    expect(result[0].slug).toBe("a");
    expect(result[1].slug).toBe("b");
    expect(result[2].slug).toBe("c");
    expect(result.every((p) => p.slug !== "hidden-post")).toBe(true);
  });

  it("limits when limit is given", () => {
    const result = listPosts(posts, { limit: 2 });
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe("a");
  });

  it("does not mutate the input array", () => {
    const clone = [...posts];
    listPosts(posts);
    expect(posts).toEqual(clone);
  });
});

describe("getPost", () => {
  it("returns null for unknown slug", () => {
    expect(getPost(posts, "nonexistent")).toBeNull();
  });

  it("returns null for hidden post", () => {
    expect(getPost(posts, "hidden-post")).toBeNull();
  });

  it("returns post detail with prev/next neighbours (newer=next, older=prev)", () => {
    const detail = getPost(posts, "b");
    expect(detail).not.toBeNull();
    expect(detail!.post.slug).toBe("b");
    expect(detail!.readingTime).toBeGreaterThanOrEqual(1);
    expect(detail!.wordCount).toBeGreaterThan(0);
    expect(detail!.prevPost?.slug).toBe("c"); // older = previous
    expect(detail!.nextPost?.slug).toBe("a"); // newer = next
  });

  it("returns null neighbours at edges", () => {
    const newest = getPost(posts, "a");
    expect(newest!.nextPost).toBeNull();
    expect(newest!.prevPost?.slug).toBe("b");

    const oldest = getPost(posts, "c");
    expect(oldest!.prevPost).toBeNull();
    expect(oldest!.nextPost?.slug).toBe("b");
  });
});
