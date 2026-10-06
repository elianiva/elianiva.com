import { createFileRoute } from "@tanstack/react-router";
import { PostList } from "~/features/posts/components/post-list";
import { seo, ogPageImageUrl } from "~/lib/seo";

export const Route = createFileRoute("/posts/")({
  component: PostList,
  head: () =>
    seo({
      title: "Posts",
      description: "All blog posts",
      ogImage: ogPageImageUrl("posts"),
      path: "/posts",
    }),
});
