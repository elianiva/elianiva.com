import { lazy, type ComponentType } from "react";
import type { MDXContent, MDXProps } from "mdx/types";

type Loaders = Record<string, () => Promise<{ default: MDXContent }>>;

// Each MDX body is its own chunk, fetched only by the page that renders it.
// Importing them statically through the content collection put every post and
// project in one ~1 MB chunk that the home page preloaded.
const postLoaders = import.meta.glob<{ default: MDXContent }>("/src/content/posts/*.mdx");
const projectLoaders = import.meta.glob<{ default: MDXContent }>("/src/content/projects/*.mdx");

const cache = new Map<string, ComponentType<MDXProps>>();
// Components whose chunk has already been fetched. Rendering one never suspends.
const loaded = new Map<string, ComponentType<MDXProps>>();

function lazyMdx(kind: "posts" | "projects", loaders: Loaders, slug: string) {
  const key = `${kind}/${slug}`;
  const ready = loaded.get(key);
  if (ready) return ready;
  let component = cache.get(key);
  if (!component) {
    const load = loaders[`/src/content/${kind}/${slug}.mdx`];
    if (!load) return null;
    component = lazy(load) as ComponentType<MDXProps>;
    cache.set(key, component);
  }
  return component;
}

// Called from route loaders so the chunk is fetched during navigation (and on
// link hover/focus via preload) instead of suspending after the page renders.
async function preloadMdx(kind: "posts" | "projects", loaders: Loaders, slug: string) {
  const key = `${kind}/${slug}`;
  const load = loaders[`/src/content/${kind}/${slug}.mdx`];
  if (!load || loaded.has(key)) return;
  const mod = await load();
  loaded.set(key, mod.default as ComponentType<MDXProps>);
}

export const postMdx = (slug: string) => lazyMdx("posts", postLoaders, slug);
export const projectMdx = (slug: string) => lazyMdx("projects", projectLoaders, slug);
export const preloadPostMdx = (slug: string) => preloadMdx("posts", postLoaders, slug);
export const preloadProjectMdx = (slug: string) => preloadMdx("projects", projectLoaders, slug);
