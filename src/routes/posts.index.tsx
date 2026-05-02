import { createFileRoute } from "@tanstack/react-router";
import { PostList } from "~/features/posts/components/post-list";
import { getPosts } from "~/features/posts/lib/posts";
import { seo } from "~/lib/seo";

export const Route = createFileRoute("/posts/")({
  component: PostList,
  loader: () => getPosts(),
  head: () => seo({ title: "Posts", description: "All blog posts" }),
});
