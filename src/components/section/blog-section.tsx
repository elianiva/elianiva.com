import { Suspense } from "react";
import { PostCard } from "~/components/card/post-card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPosts } from "~/lib/posts";
import { Heading } from "~/components/ui/heading";
import { Skeleton } from "~/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { AnimatedSection } from "~/components/ui/animated-section";
import { AnimatedItem } from "~/components/ui/animated-item";

function BlogPostList() {
  const { data: posts } = useSuspenseQuery({
    queryKey: ["blog-posts"],
    queryFn: () => getPosts(),
    staleTime: Infinity,
  });

  return (
    <>
      {posts.slice(0, 6).map((post) => (
        <AnimatedItem key={post.slug}>
          <PostCard
            title={post.title}
            description={post.description}
            href={`/posts/${post.slug}`}
            date={post.date}
            tags={post.tags}
          />
        </AnimatedItem>
      ))}
    </>
  );
}

export function BlogSection() {
  return (
    <AnimatedSection className="py-4 md:py-8 px-2 md:px-8">
      <AnimatedItem>
        <Heading level={2} id="blog-heading">
          Blog
        </Heading>
      </AnimatedItem>
      <AnimatedItem>
        <p className="text-sm md:text-base font-body text-pink-950/70 pt-2 pb-4">
          Even though I don&apos;t write often, I try to share my thoughts and experiences from time
          to time. Hope you find them useful!
        </p>
      </AnimatedItem>
      <div className="space-y-1 pb-4 items-stretch">
        <Suspense fallback={<div className="space-y-1"><Skeleton className="h-[72px] w-full" /><Skeleton className="h-[72px] w-full" /><Skeleton className="h-[72px] w-3/4" /></div>}>
          <BlogPostList />
        </Suspense>
      </div>
      <AnimatedItem className="flex justify-end">
        <Button render={<Link to="/posts" />} variant="link" className="text-sm p-0 font-normal">
          View All Posts
        </Button>
      </AnimatedItem>
    </AnimatedSection>
  );
}