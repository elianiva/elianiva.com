import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";
import { z } from "zod";

// Strip Astro/Svelte component imports from MDX content.
// Components are provided at runtime via <MDXContent components={{...}} />.
function stripComponentImports(content: string): string {
  const lines = content.split("\n");
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("import ")) return true;
    // Keep imports that are not Astro/Svelte components
    return !(
      trimmed.includes('"~/components/') ||
      trimmed.includes("'~/components/") ||
      trimmed.includes('"../components/') ||
      trimmed.includes("'../components/")
    );
  });
  return filtered.join("\n");
}

const prettyCodeOptions: PrettyCodeOptions = {
  theme: "rose-pine-dawn",
  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className ??= [];
    node.properties.className.push("line--highlighted");
  },
  onVisitHighlightedChars(node) {
    node.properties.className ??= [];
    node.properties.className.push("word--highlighted");
  },
};

const posts = defineCollection({
  name: "posts",
  directory: "src/content/posts",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const cleaned = stripComponentImports(document.content);
    const mdx = await compileMDX(
      context,
      { ...document, content: cleaned },
      {
        rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
      },
    );
    return {
      ...document,
      slug: document._meta.path,
      mdx,
    };
  },
});

const projects = defineCollection({
  name: "projects",
  directory: "src/content/projects",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string(),
    demo: z.string().nullable().optional(),
    source: z.string(),
    type: z.enum(["personal", "work", "open-source", "assignment"]),
    featured: z.boolean().optional(),
    stack: z.array(z.tuple([z.string(), z.string()])).optional(),
    hasImage: z.boolean().optional(),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const cleaned = stripComponentImports(document.content);
    const mdx = await compileMDX(
      context,
      { ...document, content: cleaned },
      {
        rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
      },
    );
    return {
      ...document,
      slug: document._meta.path,
      mdx,
    };
  },
});

export default defineConfig({
  content: [posts, projects],
});
