import {
  createDefaultImport,
  defineCollection,
  defineConfig,
  type WriterHook,
} from "@content-collections/core";
import { z } from "zod";

const serverOnlyHook: WriterHook = async ({ fileType, content }) => {
  if (fileType === "typeDefinition") {
    return { content };
  }
  return {
    content: `import '@tanstack/react-start/server-only';\n\n${content}`,
  };
};

const posts = defineCollection({
  name: "posts",
  directory: "./src/content/posts",
  include: "*.mdx",
  parser: "frontmatter-only",
  schema: z.object({
    title: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean().optional().default(false),
  }),
  transform: async ({ _meta, ...post }) => {
    const mdx = createDefaultImport(
      `~/content/posts/${_meta.filePath}`,
    );
    return {
      ...post,
      slug: _meta.path,
      mdx,
    };
  },
});

const projects = defineCollection({
  name: "projects",
  directory: "./src/content/projects",
  include: "*.mdx",
  parser: "frontmatter-only",
  schema: z.object({
    title: z.string(),
    featured: z.boolean().optional().default(false),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string(),
    source: z.url(),
    demo: z.url().optional().nullable(),
    type: z.enum(["personal", "open-source", "assignment"]),
    stack: z.array(z.tuple([z.string(), z.url()])),
  }),
  transform: async ({ _meta, ...project }) => {
    const mdx = createDefaultImport(
      `~/content/projects/${_meta.filePath}`,
    );
    return {
      ...project,
      slug: _meta.path,
      mdx,
    };
  },
});

export default defineConfig({
  content: [posts, projects],
  hooks: {
    writer: [serverOnlyHook],
  },
});
