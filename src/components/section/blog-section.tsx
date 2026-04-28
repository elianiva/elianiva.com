import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { allPosts } from "content-collections";
import { PostCard } from "~/components/card/post-card";
import { ViewAllButton } from "~/components/view-all-button";
import { Skeleton } from "~/components/ui/skeleton";

const getPosts = createServerFn({ method: "GET" }).handler(async () => {
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
});

function BlogSkeleton() {
  return (
    <section className="py-4 md:py-8 px-2 md:px-8">
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-5 w-full max-w-xl mb-4" />
      <div className="relative grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3 pb-4 items-stretch">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white/60 p-4 h-full flex flex-col gap-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-1 mt-auto">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-32" />
    </section>
  );
}

function BlogSectionContent() {
  const { data: posts } = useSuspenseQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
  });

  return (
    <>
      <h2
        data-anime
        id="blog-heading"
        className="text-2xl font-bold font-display text-pink-950 tracking-wide pt-2"
      >
        Blog
      </h2>
      <p data-anime className="text-sm md:text-base font-body text-pink-950/70 pt-2 pb-4">
        Even though I don&apos;t write often, I try to share my thoughts and experiences from time
        to time. Hope you find them useful!
      </p>
      <div className="relative grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3 pb-4 items-stretch">
        {posts.slice(0, 6).map((post) => (
          <div key={post.slug} data-anime className="h-full">
            <PostCard
              title={post.title}
              description={post.description}
              href={`/posts/${post.slug}`}
              date={post.date}
              tags={post.tags}
            />
          </div>
        ))}
      </div>
      <div data-anime>
        <ViewAllButton href="/posts" label="View all posts" ariaLabel="View all blog posts" />
      </div>
    </>
  );
}

export function BlogSection() {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <section className="py-4 md:py-8 px-2 md:px-8">
        <BlogSectionContent />
      </section>
    </Suspense>
  );
}
