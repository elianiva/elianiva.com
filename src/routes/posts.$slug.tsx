import { createFileRoute, notFound, Link } from "@tanstack/react-router";
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
import sites from "#/data/sites";
import PencilIcon from "~icons/ph/note-pencil";

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

    // Calculate word count and reading time
    const contentWithoutHeaders = post.content?.replace(/^(#+\s*)/gm, "") || "";
    const wordCount = contentWithoutHeaders.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return { post, prevPost, nextPost, wordCount, readingTime };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post.title ?? "Post"} | ${sites.siteName}` },
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
  const { post, prevPost, nextPost, wordCount, readingTime } = Route.useLoaderData();

  const ogImageParams = new URLSearchParams({
    title: post.title,
    date: post.date,
    tags: post.tags.join(","),
    description: post.description,
  });

  return (
    <>
      <SEO
        title={post.title}
        description={post.description}
        keywords={post.tags}
        isPost
        publishedAt={post.date}
        thumbnail={`${sites.siteUrl}/api/og-image?${ogImageParams.toString()}`}
      />
      <div className="mx-auto max-w-[64ch] px-4 lg:px-0 py-10">
        <BackButton />

        {/* Post header */}
        <article className="pt-6">
          <h1 className="text-center font-heading text-3xl uppercase mt-12 mb-2 font-semibold text-pink-950">
            {post.title}
          </h1>

          <div className="flex flex-col md:flex-row md:justify-center items-center gap-2 font-body text-sm md:text-base md:leading-loose text-pink-950/70">
            Posted on
            <span className="text-pink-600 font-medium">
              {new Date(post.date).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="font-medium">
              <span className="hidden md:inline">- </span> {readingTime} min read · {wordCount.toLocaleString("en-GB")} words
            </span>
          </div>

          <a
            className="block text-center relative no-underline hover:underline hover:text-pink-400 font-body text-sm md:text-base text-pink-950/70 mb-2 focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2 rounded px-2 py-1"
            href={`https://github.com/elianiva/elianiva.com/blob/master/src/content/posts/${post.slug}.mdx`}
            target="_blank"
            rel="norel noreferrer"
            aria-label="Suggest an edit to this post on GitHub"
          >
            Suggest An Edit
            <PencilIcon width="16" height="16" className="inline-block" />
          </a>

          <div className="justify-center flex gap-2 pb-4 mb-8 border-b border-dashed border-pink-300">
            {post.tags.map((tag) => (
              <span key={tag} className="font-mono text-pink-700/80 text-sm font-medium">
                #{tag}
              </span>
            ))}
          </div>

          {/* Post content */}
          <div className="font-body mx-auto max-w-[64ch] prose prose-pink">
            <CodeCopy />
            <MDXContent code={post.mdx} components={mdxComponents} />

            {/* Giscus comments */}
            <div>
              <script
                src="https://giscus.app/client.js"
                data-repo="elianiva/elianiva.com"
                data-repo-id="MDEwOlJlcG9zaXRvcnkzMDE0NjE4NDU="
                data-category="General"
                data-category-id="DIC_kwDOEffxVc4CRq7s"
                data-mapping="pathname"
                data-strict="0"
                data-reactions-enabled="1"
                data-emit-metadata="0"
                data-input-position="bottom"
                data-theme="light"
                data-lang="en"
                crossOrigin="anonymous"
                async
              />
            </div>
            <p className="mt-4! text-sm text-pink-950/70">
              If you don&apos;t see any comment section, please turn off your adblocker :)
            </p>
          </div>
        </article>

        {/* Prev/Next navigation */}
        <nav className="mt-12 pt-6 border-t border-pink-200/50">
          <div className="grid grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                to={`/posts/${prevPost.slug}` as any}
                className="group flex flex-col bg-white/60 p-4 hover:bg-white transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
              >
                <span className="text-xs font-mono text-pink-950/50 uppercase tracking-wider">
                  Previous
                </span>
                <span className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors line-clamp-2">
                  {prevPost.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {nextPost ? (
              <Link
                to={`/posts/${nextPost.slug}` as any}
                className="group flex flex-col items-end text-right bg-white/60 p-4 hover:bg-white transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
              >
                <span className="text-xs font-mono text-pink-950/50 uppercase tracking-wider">
                  Next
                </span>
                <span className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors line-clamp-2">
                  {nextPost.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
