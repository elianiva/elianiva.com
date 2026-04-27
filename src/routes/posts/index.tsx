import { createFileRoute, Link } from "@tanstack/react-router";
import { allPosts } from "content-collections";
import { PostList } from "#/components/PostList";
import { BackButton } from "#/components/BackButton";
import sites from "#/data/sites";

export const Route = createFileRoute("/posts/")({
  component: PostsPage,
  loader: async () => {
    const posts = allPosts
      .filter((p) => !p.draft)
      .sort((a, b) => (a.date > b.date ? -1 : 1));
    return { posts };
  },
  head: () => ({
    meta: [{ title: `Posts | ${sites.siteName}` }],
  }),
  notFoundComponent: PostsNotFoundPage,
});

function PostsNotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1080px] items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl border border-pink-200 bg-white/80 p-6 shadow-soft backdrop-blur-sm md:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-pink-400">404 / posts</p>
        <h1 className="mt-3 text-3xl font-display text-pink-800 md:text-5xl">This post shelf is empty here.</h1>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-pink-950/75 md:text-base">The post you asked for does not exist. Maybe it never did, maybe it moved into the stars.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/" className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100">Home</Link>
          <Link to="/posts" className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100">Posts index</Link>
        </div>
      </div>
    </div>
  )
}

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