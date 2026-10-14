import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPosts } from "~/features/posts/lib/posts";
import { Heading } from "~/components/ui/heading";
import { Skeleton } from "~/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { PostRow } from "~/features/posts/components/post-row";

function BlogPostList() {
  const { data: posts } = useSuspenseQuery({
    queryKey: ["blog-posts"],
    queryFn: () => getPosts({ limit: 6 }),
    staleTime: Infinity,
  });

  return (
    <div>
      {posts.map((post) => (
        <PostRow
          key={post.slug}
          slug={post.slug}
          title={post.title}
          description={post.description}
          date={post.date}
        />
      ))}
    </div>
  );
}

export function BlogSection() {
  return (
    <section aria-labelledby="blog-heading" className="py-4 md:py-8 px-2 md:px-8">
      <div>
        <Heading level={2} id="blog-heading">
          Blog
        </Heading>
      </div>
      <div>
        <p className="text-sm md:text-base font-body text-pink-950/70 pt-2 pb-4">
          Even though I don&apos;t write often, I try to share my thoughts and experiences from time
          to time. Hope you find them useful!
        </p>
      </div>
      <div className="space-y-1 pb-4 items-stretch">
        <Suspense
          fallback={
            <div className="space-y-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          }
        >
          <BlogPostList />
        </Suspense>
      </div>
      <div className="flex justify-end">
        <Button render={<Link to="/posts" />} variant="link" className="text-sm p-0 font-normal">
          View All Posts
        </Button>
      </div>
    </section>
  );
}
