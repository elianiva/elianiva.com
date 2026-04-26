import { createFileRoute, notFound } from "@tanstack/react-router";
import { allPosts } from "content-collections";
import { MDXContent } from "@content-collections/mdx/react";
import { BackButton } from "#/components/BackButton";
import { CodeCopy } from "#/components/CodeCopy";
import { Update } from "#/components/Update";
import { Greentext } from "#/components/Greentext";
import { Quiz } from "#/components/Quiz";
import { RegexHighlighter } from "#/components/RegexHighlighter";
import { TermPopover } from "#/components/TermPopover";
import { SEO } from "#/components/SEO";
import CalendarIcon from "~icons/ph/calendar-blank";
import TagIcon from "~icons/ph/tag";

export const Route = createFileRoute("/posts/$slug")({
  component: PostDetailPage,
  loader: async ({ params }) => {
    const post = allPosts.find((p) => p.slug === params.slug);
    if (!post || post.draft) {
      throw notFound();
    }

    const sortedPosts = allPosts
      .filter((p) => !p.draft)
      .sort((a, b) => (a.date > b.date ? -1 : 1));

    const currentIndex = sortedPosts.findIndex((p) => p.slug === params.slug);
    const prevPost = sortedPosts[currentIndex + 1] || null;
    const nextPost = sortedPosts[currentIndex - 1] || null;

    return { post, prevPost, nextPost };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post.title ?? "Post"} | elianiva's home row` },
    ],
  }),
});

const mdxComponents = {
  Update,
  Greentext,
  Quiz,
  RegexHighlighter,
  TermPopover,
};

function PostDetailPage() {
  const { post, prevPost, nextPost } = Route.useLoaderData();

  return (
    <>
      <SEO
        title={post.title}
        description={post.description}
        keywords={post.tags}
        isPost
        publishedAt={post.date}
      />
      <div className="mx-auto max-w-[1080px] pt-20 border-x border-pink-200/50 min-h-screen">
        <div className="py-4 md:py-8 px-2 md:px-8">
          <BackButton />

          {/* Post header */}
          <article className="pt-6">
            <h1 className="text-2xl md:text-4xl font-bold font-display text-pink-950 tracking-wide pb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 pb-6 text-sm text-pink-950/70 border-b border-pink-200/50">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4" />
                <span className="font-body">
                  {new Date(post.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <TagIcon className="w-4 h-4" />
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono text-pink-950/70 bg-pink-50/80 px-2 py-0.5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Post content */}
            <div className="prose prose-pink max-w-none pt-6">
              <CodeCopy />
              <MDXContent code={post.mdx} components={mdxComponents} />
            </div>
          </article>

          {/* Prev/Next navigation */}
          <nav className="mt-12 pt-6 border-t border-pink-200/50">
            <div className="grid grid-cols-2 gap-4">
              {prevPost ? (
                <a
                  href={`/posts/${prevPost.slug}`}
                  className="group flex flex-col bg-white/60 p-4 hover:bg-white transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
                >
                  <span className="text-xs font-mono text-pink-950/50 uppercase tracking-wider">
                    Previous
                  </span>
                  <span className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors line-clamp-2">
                    {prevPost.title}
                  </span>
                </a>
              ) : (
                <div />
              )}
              {nextPost ? (
                <a
                  href={`/posts/${nextPost.slug}`}
                  className="group flex flex-col items-end text-right bg-white/60 p-4 hover:bg-white transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
                >
                  <span className="text-xs font-mono text-pink-950/50 uppercase tracking-wider">
                    Next
                  </span>
                  <span className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors line-clamp-2">
                    {nextPost.title}
                  </span>
                </a>
              ) : (
                <div />
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
