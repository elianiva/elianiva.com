import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allPosts } from "content-collections";
import { BackButton } from "~/components/back-button";
import { CodeCopy } from "~/components/code-copy";
import { SEO } from "~/components/seo";
import sites from "~/data/sites";
import PencilIcon from "~icons/ph/note-pencil";

const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const post = allPosts.find((p) => p.slug === slug);
    if (!post || post.draft) {
      throw notFound();
    }

    const sortedPosts = allPosts.filter((p) => !p.draft).sort((a, b) => (a.date > b.date ? -1 : 1));
    const currentIndex = sortedPosts.findIndex((p) => p.slug === slug);
    const prevPost = sortedPosts[currentIndex + 1] || null;
    const nextPost = sortedPosts[currentIndex - 1] || null;

    const contentWithoutHeaders = post.content?.replace(/^(#+\s*)/gm, "") || "";
    const wordCount = contentWithoutHeaders.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const MDXContent = post.mdx;

    return {
      title: post.title,
      date: post.date,
      description: post.description,
      tags: post.tags,
      slug: post.slug,
      wordCount,
      readingTime,
      prevPost: prevPost ? { slug: prevPost.slug, title: prevPost.title } : null,
      nextPost: nextPost ? { slug: nextPost.slug, title: nextPost.title } : null,
      mdx: await renderServerComponent(<MDXContent />),
    };
  });

export const Route = createFileRoute("/posts/$slug")({
  component: PostDetailPage,
  loader: ({ params: { slug } }) => getPostBySlug({ data: slug }),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Post"} | ${sites.siteName}` },
      { name: "description", content: loaderData?.description ?? sites.description },
      { property: "og:title", content: loaderData?.title ?? "Post" },
      { property: "og:description", content: loaderData?.description ?? sites.description },
    ],
  }),
  notFoundComponent: PostNotFoundPage,
});

function PostNotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1080px] items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl border border-pink-200 bg-white/80 p-6 shadow-soft backdrop-blur-sm md:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-pink-400">404 / posts</p>
        <h1 className="mt-3 text-3xl font-display text-pink-800 md:text-5xl">
          This post shelf is empty here.
        </h1>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-pink-950/75 md:text-base">
          The post you asked for does not exist. Maybe it drifted out of the archive.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100"
          >
            Home
          </Link>
          <Link
            to="/posts"
            className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100"
          >
            Posts index
          </Link>
        </div>
      </div>
    </div>
  );
}

function PostDetailPage() {
  const post = Route.useLoaderData();

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
              <span className="hidden md:inline">- </span> {post.readingTime} min read ·{" "}
              {post.wordCount.toLocaleString("en-GB")} words
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

          <div className="font-body mx-auto max-w-[64ch] prose prose-pink">
            <CodeCopy />
            {post.mdx}

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

        <nav className="mt-12 pt-6 border-t border-pink-200/50">
          <div className="grid grid-cols-2 gap-4">
            {post.prevPost ? (
              <Link
                to={`/posts/${post.prevPost.slug}` as any}
                className="group flex flex-col bg-white/60 p-4 hover:bg-white transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
              >
                <span className="text-xs font-mono text-pink-950/50 uppercase tracking-wider">
                  Previous
                </span>
                <span className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors line-clamp-2">
                  {post.prevPost.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {post.nextPost ? (
              <Link
                to={`/posts/${post.nextPost.slug}` as any}
                className="group flex flex-col items-end text-right bg-white/60 p-4 hover:bg-white transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
              >
                <span className="text-xs font-mono text-pink-950/50 uppercase tracking-wider">
                  Next
                </span>
                <span className="font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors line-clamp-2">
                  {post.nextPost.title}
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
