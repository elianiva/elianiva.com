import { Suspense } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PostCard } from "~/components/card/post-card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPosts } from "~/lib/posts";
import { Heading } from "~/components/ui/heading";
import { Skeleton } from "~/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
} as const;

function BlogPostList() {
  const { data: posts } = useSuspenseQuery({
    queryKey: ["blog-posts"],
    queryFn: () => getPosts(),
    staleTime: Infinity,
  });

  return (
    <>
      {posts.slice(0, 6).map((post) => (
        <motion.div key={post.slug} variants={item}>
          <PostCard
            title={post.title}
            description={post.description}
            href={`/posts/${post.slug}`}
            date={post.date}
            tags={post.tags}
          />
        </motion.div>
      ))}
    </>
  );
}

export function BlogSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      className="py-4 md:py-8 px-2 md:px-8"
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={container}
    >
      <motion.div variants={item}>
        <Heading level={2} id="blog-heading">
          Blog
        </Heading>
      </motion.div>
      <motion.div variants={item}>
        <p className="text-sm md:text-base font-body text-pink-950/70 pt-2 pb-4">
          Even though I don&apos;t write often, I try to share my thoughts and experiences from time
          to time. Hope you find them useful!
        </p>
      </motion.div>
      <div className="space-y-1 pb-4 items-stretch">
        <Suspense fallback={<div className="space-y-1"><Skeleton className="h-[72px] w-full" /><Skeleton className="h-[72px] w-full" /><Skeleton className="h-[72px] w-3/4" /></div>}>
          <BlogPostList />
        </Suspense>
      </div>
      <motion.div variants={item} className="flex justify-end">
        <Button render={<Link to="/posts" />} variant="link" className="text-sm p-0 font-normal">
          View All Posts
        </Button>
      </motion.div>
    </motion.section>
  );
}
