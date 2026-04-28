import { createServerFn } from "@tanstack/react-start";
import { motion, useReducedMotion } from "motion/react";
import { allPosts } from "content-collections";
import { PostCard } from "~/components/card/post-card";
import { ViewAllButton } from "~/components/view-all-button";
import { Heading } from "../ui/heading";

export const getBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
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
};

interface BlogSectionProps {
  posts: Awaited<ReturnType<typeof getBlogPosts>>;
}

export function BlogSection({ posts }: BlogSectionProps) {
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
      </div>
      <motion.div variants={item}>
        <ViewAllButton href="/posts" label="View all posts" ariaLabel="View all blog posts" />
      </motion.div>
    </motion.section>
  );
}
