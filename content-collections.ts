import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

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
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
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
    demo: z.string().nullable(),
    source: z.string(),
    type: z.enum(["personal", "work"]),
    featured: z.boolean(),
    stack: z.array(z.tuple([z.string(), z.string()])),
    hasImage: z.boolean().optional(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
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
