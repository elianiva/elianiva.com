import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useLoaderData, Link } from "@tanstack/react-router";
import { PostCard } from "./post-card";
import { BackButton } from "~/components/back-button";
import { Heading } from "~/components/ui/heading";
import { NotFound } from "~/components/not-found";
import XIcon from "~icons/ph/x";
import type { Post } from "content-collections";

function searchPosts(posts: Post[], query: string): Post[] {
  const q = query.toLowerCase();
  return posts.filter((post) => {
    if (post.title.toLowerCase().includes(q)) return true;
    if (post.description?.toLowerCase().includes(q)) return true;
    if (post.slug.toLowerCase().includes(q)) return true;
    if (post.tags?.some((t) => t.toLowerCase().includes(q))) return true;
    return false;
  });
}

export function PostList() {
  const posts = useLoaderData({ from: "/posts" }) as Post[] | null;

  if (!posts) {
    return (
      <NotFound
        path="posts"
        label="Blog Posts"
        title="This post shelf is empty here."
        description="The post you asked for does not exist. Maybe it never did, maybe it moved into the stars."
        backTo={{ to: "/posts", label: "Posts index" }}
      />
    );
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
    return [...tags].sort();
  }, [posts]);

  const suggestions = useMemo(() => {
    if (!searchQuery.startsWith("#")) return [];
    const query = searchQuery.slice(1).toLowerCase();
    return allTags.filter((t) => t.toLowerCase().includes(query));
  }, [searchQuery, allTags]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (selectedTags.length > 0) {
      result = result.filter((p) => selectedTags.every((t) => p.tags.includes(t)));
    }
    if (searchQuery && !searchQuery.startsWith("#")) {
      result = searchPosts(result, searchQuery);
    }
    return result;
  }, [posts, selectedTags, searchQuery]);

  const announce = useCallback((message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message;
    }
  }, []);

  useEffect(() => {
    announce(`${filteredPosts.length} post${filteredPosts.length === 1 ? "" : "s"} found`);
  }, [filteredPosts.length, announce]);

  const addTag = useCallback((tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setSearchQuery("");
    setShowSuggestions(false);
    setActiveOptionIndex(-1);
    inputRef.current?.focus();
  }, []);

  const removeTag = useCallback((tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
    inputRef.current?.focus();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setActiveOptionIndex(-1);
    setShowSuggestions(e.target.value.startsWith("#") && e.target.value.length > 1);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveOptionIndex((i) => Math.min(i + 1, suggestions.length - 1));
        setShowSuggestions(true);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveOptionIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeOptionIndex >= 0 && suggestions[activeOptionIndex]) {
          addTag(suggestions[activeOptionIndex]);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setActiveOptionIndex(-1);
      }
    },
    [suggestions, activeOptionIndex, addTag],
  );

  return (
    <div className="mx-auto max-w-container pt-20 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <BackButton />
        <Heading level={1} className="mb-4">
          Blog Posts
        </Heading>
        <div className="space-y-4">
          {/* Screen reader announcement */}
          <div ref={announceRef} aria-live="polite" aria-atomic="true" className="sr-only" />
          {/* Search input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search posts... (use # to filter by tag)"
              className="w-full border border-pink-200 bg-white/80 px-3 py-2 text-sm font-mono text-pink-950 placeholder-pink-300 focus:outline-none focus:border-pink-400"
              aria-label="Search posts"
              aria-autocomplete="list"
              aria-controls="tag-suggestions"
              aria-expanded={showSuggestions}
              role="combobox"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600"
                aria-label="Clear search"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
            {/* Tag suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <ul
                ref={listboxRef}
                id="tag-suggestions"
                role="listbox"
                className="absolute z-10 w-full bg-white border border-pink-200 shadow-card mt-1 max-h-48 overflow-y-auto"
              >
                {suggestions.map((tag, i) => (
                  <li
                    key={tag}
                    role="option"
                    aria-selected={i === activeOptionIndex}
                    className={`px-3 py-2 text-sm font-mono cursor-pointer ${
                      i === activeOptionIndex ? "bg-pink-50 text-pink-800" : "text-pink-700 hover:bg-pink-50"
                    }`}
                    onClick={() => addTag(tag)}
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-pink-50 border border-pink-200 text-pink-700"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-pink-400 hover:text-pink-600"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {/* Post grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {filteredPosts.map((post) => (
                <Link key={post.slug} to={`/posts/${post.slug}`} className="h-full">
                  <PostCard
                    title={post.title}
                    description={post.description}
                    href={`/posts/${post.slug}`}
                    date={post.date}
                    tags={post.tags}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center font-mono text-sm text-pink-400 mt-10">
              No posts match your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
