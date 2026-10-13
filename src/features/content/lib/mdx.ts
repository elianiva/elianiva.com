import { lazy, type ComponentType } from "react";
import type { MDXContent, MDXProps } from "mdx/types";

type Loaders = Record<string, () => Promise<{ default: MDXContent }>>;

// Each MDX body is its own chunk, fetched only by the page that renders it.
// Importing them statically through the content collection put every post and
// project in one ~1 MB chunk that the home page preloaded.
const postLoaders = import.meta.glob<{ default: MDXContent }>("/src/content/posts/*.mdx");
const projectLoaders = import.meta.glob<{ default: MDXContent }>("/src/content/projects/*.mdx");

const cache = new Map<string, ComponentType<MDXProps>>();

function lazyMdx(kind: "posts" | "projects", loaders: Loaders, slug: string) {
  const key = `${kind}/${slug}`;
  let component = cache.get(key);
  if (!component) {
    const load = loaders[`/src/content/${kind}/${slug}.mdx`];
    if (!load) return null;
    component = lazy(load) as ComponentType<MDXProps>;
    cache.set(key, component);
  }
  return component;
}

export const postMdx = (slug: string) => lazyMdx("posts", postLoaders, slug);
export const projectMdx = (slug: string) => lazyMdx("projects", projectLoaders, slug);
