import { createDefaultImport, defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";
import type { MDXContent } from "mdx/types";

const posts = defineCollection({
  name: "posts",
  directory: "src/content/posts",
  include: "**/*.mdx",
  parser: "frontmatter",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
  }),
  transform: async ({ _meta, ...post }) => {
    const mdx = createDefaultImport<MDXContent>(`~/content/posts/${_meta.filePath}`);
    return {
      ...post,
      slug: _meta.path,
      mdx,
    };
  },
});

const projects = defineCollection({
  name: "projects",
  directory: "src/content/projects",
  include: "**/*.mdx",
  parser: "frontmatter",
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
  }),
  transform: async ({ _meta, ...project }) => {
    const mdx = createDefaultImport<MDXContent>(`~/content/projects/${_meta.filePath}`);
    return {
      ...project,
      slug: _meta.path,
      mdx,
    };
  },
});

export default defineConfig({
  content: [posts, projects],
});
