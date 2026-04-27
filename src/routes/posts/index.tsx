import { createFileRoute } from "@tanstack/react-router";
import { allPosts } from "content-collections";
import { PostList } from "#/components/PostList";
import { BackButton } from "#/components/BackButton";

export const Route = createFileRoute("/posts/")({
  component: PostsPage,
  loader: async () => {
    const posts = allPosts
      .filter((p) => !p.draft)
      .sort((a, b) => (a.date > b.date ? -1 : 1));
    return { posts };
  },
  head: () => ({
    meta: [{ title: "Posts | elianiva's home row" }],
  }),
});

function PostsPage() {
  const { posts } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-[1080px] pt-20 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <BackButton />
        <h1 className="text-2xl md:text-3xl font-bold font-display text-pink-950 tracking-wide pt-6 pb-4">
          Blog Posts
        </h1>
        <p className="text-sm md:text-base font-body text-pink-950/70 pb-6">
          All my blog posts in one place. Use the search box to filter by title
          or use # to filter by tags.
        </p>
        <PostList posts={posts} />
      </div>
    </div>
  );
}
