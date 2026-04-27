import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import { PostCard } from "#/components/card/PostCard";
import XIcon from "~icons/ph/x";
import type { Post } from "content-collections";

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ["title", "slug", "tags"],
        threshold: 0.4,
      }),
    [posts],
  );

  const allTags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(), [posts]);

  const suggestions = useMemo(() => {
    if (!searchQuery.startsWith("#") || searchQuery.length < 2) return [];
    const query = searchQuery.slice(1).toLowerCase();
    return allTags.filter((t) => t.toLowerCase().includes(query));
  }, [searchQuery, allTags]);

  const filteredPosts = useMemo(() => {
    let result = posts;

    if (selectedTags.length > 0) {
      result = result.filter((p) => selectedTags.every((t) => p.tags.includes(t)));
    }

    if (searchQuery && !searchQuery.startsWith("#")) {
      result = fuse.search(searchQuery).map((r) => r.item);
    }

    return result;
  }, [posts, selectedTags, searchQuery, fuse]);

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
          onFocus={() => setShowSuggestions(searchQuery.startsWith("#") && searchQuery.length > 1)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Search posts... (use # for tags)"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls="tag-suggestions"
          aria-activedescendant={
            activeOptionIndex >= 0 ? `tag-option-${activeOptionIndex}` : undefined
          }
          className="w-full bg-white/60 border border-pink-200 px-4 py-2 text-sm font-body text-pink-950 placeholder:text-pink-950/40 focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
        />

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
                id={`tag-option-${i}`}
                role="option"
                aria-selected={i === activeOptionIndex}
                onMouseDown={() => addTag(tag)}
                className={`px-4 py-2 text-sm font-body cursor-pointer ${
                  i === activeOptionIndex
                    ? "bg-pink-100 text-pink-900"
                    : "text-pink-950/70 hover:bg-pink-50"
                }`}
              >
                #{tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Selected tags">
          {selectedTags.map((tag) => (
            <button
              key={tag}
              onClick={() => removeTag(tag)}
              className="inline-flex items-center gap-1 text-xs font-mono text-pink-950/70 bg-pink-50/80 px-2 py-1 hover:bg-pink-100 transition-colors focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
              aria-label={`Remove tag ${tag}`}
            >
              #{tag}
              <XIcon className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs font-body text-pink-950/50" aria-hidden="true">
        {filteredPosts.length} post{filteredPosts.length === 1 ? "" : "s"}
      </p>

      {/* Post grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3 items-stretch">
        {filteredPosts.map((post) => (
          <div key={post.slug} className="h-full">
            <PostCard
            key={post.slug}
            title={post.title}
            description={post.description}
            href={`/posts/${post.slug}`}
            date={post.date}
            tags={post.tags}
          />
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <p className="text-center text-sm font-body text-pink-950/50 py-8">
          No posts match your search.
        </p>
      )}
    </div>
  );
}
