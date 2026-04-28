import { PostCard } from "~/components/card/post-card";
import { ViewAllButton } from "~/components/view-all-button";

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

interface BlogSectionProps {
  posts: BlogPost[];
}

export function BlogSection({ posts }: BlogSectionProps) {
  return (
    <section className="py-4 md:py-8 px-2 md:px-8">
      <h2
        data-anime
        id="blog-heading"
        className="text-2xl font-bold font-display text-pink-950 tracking-wide pt-2"
      >
        Blog
      </h2>
      <p data-anime className="text-sm md:text-base font-body text-pink-950/70 pt-2 pb-4">
        Even though I don&apos;t write often, I try to share my thoughts and experiences from time to
        time. Hope you find them useful!
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
    </section>
  );
}
