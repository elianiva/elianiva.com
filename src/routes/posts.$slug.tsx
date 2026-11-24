import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Suspense } from "react";
import { postMdx, preloadPostMdx } from "~/features/content/lib/mdx";
import { getPostBySlug } from "~/features/posts/lib/posts";
import { CodeCopy } from "~/components/code-copy";
import { Box, Cell, Postmark, STRETCHED } from "~/components/box";
import { Contents, proseComponents } from "~/components/prose";
import { LostPage } from "~/components/lost-page";
import { postSeo } from "~/lib/seo";
import { cn } from "~/lib/utils";
import PencilIcon from "~icons/ph/note-pencil";

export const Route = createFileRoute("/posts/$slug")({
  component: PostDetailPage,
  // The crawler only discovers links the index page renders, and the index
  // only links real posts — so prerender never hits this for a bogus slug
  // (a thrown notFound() would otherwise silently drop the page from the
  // output with no file and no error, even under failOnError).
  loader: async ({ params: { slug } }) => {
    const detail = getPostBySlug(slug);
    if (!detail) throw notFound();
    await preloadPostMdx(slug);
    return detail;
  },
  head: ({ loaderData }) => {
    // Hidden or unknown slugs render the 404 page; there is no post to describe.
    if (!loaderData)
      return { meta: [{ title: "Post not found" }, { name: "robots", content: "noindex" }] };
    return postSeo({
      title: loaderData.post.title,
      description: loaderData.post.description,
      date: loaderData.post.date,
      tags: loaderData.post.tags,
      slug: loaderData.post.slug,
    });
  },
  notFoundComponent: PostNotFoundPage,
});

function PostNotFoundPage() {
  return <LostPage section="post" home="/posts" />;
}

const longDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function PostDetailPage() {
  const detail = Route.useLoaderData();
  const { post } = detail;
  const params = Route.useParams();
  // A component cannot be serialized into the prerender payload, so it is
  // resolved here and loaded lazily as its own chunk.
  const Mdx = postMdx(params.slug);
  if (!Mdx) throw notFound();
  const neighbours = [
    { dir: "Previous", post: detail.prevPost },
    { dir: "Next", post: detail.nextPost },
  ];

  return (
    <Box square={false}>
      <Cell as="header" span="w3" tone="white" label="Post" className="gap-4 py-8 md:p-10">
        <h1 className="font-display text-4xl leading-[1.05] font-extrabold text-pink-950 text-balance md:text-6xl">
          {post.title}
        </h1>
        <p className="max-w-[56ch] text-lg text-pink-950/70 text-pretty">{post.description}</p>
      </Cell>
      <Cell as="aside" tone="yellow" className="col-span-2 justify-between gap-5 md:col-span-1">
        <Postmark className="size-24 self-end text-[11px]">
          <span suppressHydrationWarning>{longDate.format(new Date(post.date))}</span>
        </Postmark>
        <dl className="grid grid-cols-2 gap-y-1 font-mono text-[11px] text-pink-950/65">
          <dt>read</dt>
          <dd className="text-right text-pink-950">{detail.readingTime} min</dd>
          <dt>words</dt>
          <dd className="text-right text-pink-950">{detail.wordCount.toLocaleString("en-GB")}</dd>
        </dl>
        <p className="font-mono text-[11px] text-pink-600">
          {post.tags.map((tag) => `#${tag}`).join(" ")}
        </p>
        <a
          className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-pink-950/70 uppercase hover:text-pink-600"
          href={`https://github.com/elianiva/elianiva.com/blob/master/src/content/posts/${post.slug}.mdx`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Suggest an edit to this post on GitHub"
        >
          <PencilIcon className="size-3.5" />
          Suggest an edit
        </a>
      </Cell>

      <Cell as="div" span="w3" className="p-4 py-8 md:p-10">
        <article id="post-body" className="prose prose-pink mx-auto w-full max-w-[66ch] font-body">
          <CodeCopy />
          <Suspense fallback={null}>
            <Mdx components={proseComponents} />
          </Suspense>
          <div className="mt-14">
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
      </Cell>
      <Cell as="aside" className="hidden md:flex">
        <Contents articleId="post-body" />
      </Cell>

      {neighbours.map(({ dir, post: other }) =>
        other ? (
          <Cell
            key={dir}
            linked
            span="w2"
            tone={dir === "Next" ? "pink" : "paper"}
            label={
              <Link to="/posts/$slug" params={{ slug: other.slug }} className={STRETCHED}>
                {dir}
              </Link>
            }
            className={cn("xl:col-span-3", dir === "Next" && "md:items-end md:text-right")}
          >
            <p className="font-display text-xl font-bold text-pink-950 text-balance">
              {other.title}
            </p>
          </Cell>
        ) : (
          <Cell key={dir} span="w2" tone="hatch" className="hidden md:flex xl:col-span-3" />
        ),
      )}
    </Box>
  );
}
