import { createFileRoute, Link } from "@tanstack/react-router";
import { getPostBySlug } from "~/features/posts/lib/posts";
import { CodeCopy } from "~/components/code-copy";
import { Badge } from "~/components/ui/badge";
import { postSeo } from "~/lib/seo";
import { PostDetailSkeleton } from "~/components/ui/page-skeleton";
import PencilIcon from "~icons/ph/note-pencil";

export const Route = createFileRoute("/posts/$slug")({
  component: PostDetailPage,
  pendingComponent: PostDetailSkeleton,
  loader: ({ params: { slug } }) => getPostBySlug({ data: slug }),
  head: ({ loaderData }) => {
    if (!loaderData)
      return postSeo({ title: "Post", description: "", date: "", tags: [], slug: "" });
    return postSeo({
      title: loaderData.title,
      description: loaderData.description,
      date: loaderData.date,
      tags: loaderData.tags,
      slug: loaderData.slug,
    });
  },
  notFoundComponent: PostNotFoundPage,
});

function PostNotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-container items-center justify-center px-4 py-16">
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

  return (
    <>
      <div className="px-2 md:px-0 pt-24 border-x mx-auto max-w-container">
        <header className="mx-auto max-w-[64ch] flex flex-col items-center gap-3 pb-6 text-center">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-pink-400">
            <span aria-hidden="true" className="size-2 bg-pink-400" />
            Post
          </p>
          <h1 className="font-display text-xl font-extrabold uppercase leading-[1.12] tracking-wide text-pink-950 text-balance md:text-3xl">
            {post.title}
          </h1>
          <div aria-hidden="true" className="relative h-px w-full bg-pink-200/50">
            <div className="absolute bottom-0 left-1/2 flex h-0.5 -translate-x-1/2">
              <div className="h-0.5 w-[5ch] bg-pink-200" />
              <div className="h-0.5 w-[2ch] bg-pink-300" />
            </div>
          </div>
          <p className="font-body text-sm leading-snug text-pink-950/70">{post.description}</p>
          <p className="font-body text-xs leading-relaxed text-pink-950/60 md:text-sm">
            <span suppressHydrationWarning>
              {new Date(post.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>{" "}
            · {post.readingTime} min read · {post.wordCount.toLocaleString("en-GB")} words ·{" "}
            <a
              className="inline-flex items-center gap-1 text-pink-950/60 hover:text-pink-400 focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2 rounded"
              href={`https://github.com/elianiva/elianiva.com/blob/master/src/content/posts/${post.slug}.mdx`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Suggest an edit to this post on GitHub"
            >
              Suggest An Edit
              <PencilIcon width="14" height="14" className="inline-block" />
            </a>
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        </header>
        <article className="font-body mx-auto max-w-[64ch] prose prose-pink">
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
        </article>

        <nav className="mt-12 border-t border-pink-200/50 max-sm:-mx-2">
          <div className="grid md:grid-cols-2">
            {post.prevPost ? (
              <Link
                to="/posts/$slug"
                params={{ slug: post.prevPost.slug }}
                className="max-sm:border-b md:border-r group flex flex-col p-4 hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
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
                to="/posts/$slug"
                params={{ slug: post.nextPost.slug }}
                className="max-sm:border-b group flex flex-col items-end text-right p-4 hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
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
