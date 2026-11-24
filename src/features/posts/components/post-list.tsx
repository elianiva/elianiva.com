import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import XIcon from "~icons/ph/x";
import { Box, Cell, Fill, PageHead, Postmark, STRETCHED } from "~/components/box";
import { cn } from "~/lib/utils";
import { getPosts } from "~/features/posts/lib/posts";
import type { PostSummary } from "~/features/content/lib/posts";

const monthYear = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function matches(post: PostSummary, query: string): boolean {
  const q = query.toLowerCase();
  return (
    post.title.toLowerCase().includes(q) ||
    (post.description?.toLowerCase().includes(q) ?? false) ||
    post.slug.toLowerCase().includes(q) ||
    post.tags.some((t) => t.toLowerCase().includes(q))
  );
}

function PostCell({ post, featured }: { post: PostSummary; featured: boolean }) {
  return (
    <Cell
      as="article"
      linked
      span={featured ? "s2" : "w2"}
      tone={featured ? "graph" : "paper"}
      label={
        <Link to="/posts/$slug" params={{ slug: post.slug }} className={STRETCHED}>
          <span suppressHydrationWarning>{monthYear.format(new Date(post.date))}</span>
        </Link>
      }
    >
      {featured && (
        <Postmark className="absolute top-12 right-6 size-20 text-[10px]">latest post</Postmark>
      )}
      <div className={cn("mt-auto min-w-0", featured && "max-w-[85%]")}>
        <h3
          className={cn(
            "font-display leading-[1.1] font-extrabold text-pink-950 text-balance transition-colors group-hover/cell:text-pink-600",
            featured ? "text-4xl md:text-5xl" : "text-2xl",
          )}
        >
          {post.title}
        </h3>
        <p
          className={cn(
            "mt-2 text-pink-950/65 text-pretty",
            featured ? "text-base md:text-lg" : "line-clamp-2 text-sm",
          )}
        >
          {post.description}
        </p>
        <p className="mt-2 font-mono text-[11px] text-pink-500">
          {post.tags.map((t) => `#${t}`).join(" ")}
        </p>
      </div>
    </Cell>
  );
}

/**
 * The archive: a search compartment with every tag as a toggle, then one
 * compartment per post. With no filter on, the newest post gets a 2×2 cell.
 */
export function PostList() {
  const posts = useMemo(() => getPosts(), []);
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const allTags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(), [posts]);
  const filtered = posts.filter(
    (p) => tags.every((t) => p.tags.includes(t)) && (!query || matches(p, query)),
  );
  const filtering = query !== "" || tags.length > 0;
  const toggle = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  // Featured post takes 4 cells, every other post 2.
  const used = filtered.length * 2 + (!filtering && filtered.length > 0 ? 2 : 0);

  return (
    <Box head={1}>
      <PageHead
        title="Posts"
        tone="sky"
        kicker="Notes on editors, the web, Japanese, and the tools I keep rebuilding."
        aside={
          <>
            <p className="mt-auto font-display text-7xl leading-none font-extrabold text-pink-950 tabular-nums">
              {String(posts.length).padStart(2, "0")}
            </p>
            <p className="font-mono text-[11px] text-pink-950/60">posts · {allTags.length} tags</p>
          </>
        }
      />

      <Cell span="w4" label="Find a post" className="gap-2.5 py-3 md:py-4">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search…"
            aria-label="Search posts"
            className="w-full border-b-2 border-pink-200 bg-transparent pb-1 font-display text-xl text-pink-950 placeholder:text-pink-950/30 focus:border-pink-500 focus:outline-none md:text-2xl"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-0.5 right-0 text-pink-400 hover:text-pink-600"
            >
              <XIcon className="size-5" />
            </button>
          )}
        </div>
        <ul aria-label="Filter by tag" className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => {
            const on = tags.includes(tag);
            return (
              <li key={tag}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(tag)}
                  className={cn(
                    "border px-2 py-0.5 font-mono text-[11px] transition-[color,background-color,border-color,box-shadow,transform,translate,rotate,scale] active:scale-[0.97]",
                    on
                      ? "-rotate-3 border-pink-600 bg-pink-600 text-white"
                      : "border-pink-200 text-pink-700 hover:-translate-y-0.5 hover:border-pink-400 hover:bg-white",
                  )}
                >
                  #{tag}
                </button>
              </li>
            );
          })}
        </ul>
        <p
          aria-live="polite"
          className="absolute top-4 right-4 font-mono text-[11px] text-pink-950/50 md:top-5 md:right-5"
        >
          {filtering ? `${filtered.length} of ${posts.length} posts` : "\u00a0"}
        </p>
      </Cell>

      {filtered.map((post, i) => (
        <PostCell key={post.slug} post={post} featured={!filtering && i === 0} />
      ))}
      {filtered.length === 0 && (
        <Cell span="w4" tone="hatch" className="items-center justify-center text-center">
          <p className="font-mono text-sm text-pink-700">No posts match that. Try fewer tags.</p>
        </Cell>
      )}
      <Fill used={used} />
    </Box>
  );
}
