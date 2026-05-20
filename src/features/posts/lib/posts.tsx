import { createServerFn } from "@tanstack/react-start";
import { allPosts } from "content-collections";
import { PostCard } from "../components/post-card";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { Link } from "@tanstack/react-router";

export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
};

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  const posts = allPosts
    .filter((p) => !p.hidden)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      date: p.date,
      tags: p.tags,
    }))
    .slice(0, 6);

  return renderServerComponent(
    posts.map((post) => (
      <Link key={post.slug} to="/posts/$slug" params={{ slug: post.slug }} className="block">
        <PostCard
          title={post.title}
          description={post.description}
          date={post.date}
          tags={post.tags}
        />
      </Link>
    )),
  );
});
