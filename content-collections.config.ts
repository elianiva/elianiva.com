import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "./src/content/posts",
  include: "*.mdx",
  parser: "frontmatter",
  schema: z.object({
    title: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string(),
    tags: z.array(z.string()),
    hidden: z.boolean().optional().default(false),
    content: z.string(),
  }),
  // The MDX body is loaded lazily per route (see `features/content/lib/mdx`),
  // and the raw text is reduced to a word count here, so neither is bundled
  // into every page that reads the collection.
  transform: async ({ _meta, content, ...post }) => ({
    ...post,
    slug: _meta.path,
    wordCount: content.replace(/^(#+\s*)/gm, "").split(/\s+/).length,
  }),
});

/**
 * A project's place on the CV. Present means the recruiter's PDF prints it;
 * absent means the site lists it and the CV does not. The site prints every
 * project, the same way it prints every role.
 */
const cvProject = z.object({
  period: z.tuple([z.string(), z.string().nullable()]),
  details: z.array(z.string()).min(1),
});

const projects = defineCollection({
  name: "projects",
  directory: "./src/content/projects",
  include: "*.mdx",
  parser: "frontmatter",
  schema: z.object({
    title: z.string(),
    featured: z.boolean().optional().default(false),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string(),
    source: z.url(),
    demo: z.url().optional().nullable(),
    type: z.enum(["personal", "open-source", "assignment"]),
    stack: z.array(z.tuple([z.string(), z.url()])),
    /** Absent unless this project belongs in the CV. */
    cv: cvProject.optional(),
    image: z.string().optional(),
    content: z.string(),
  }),
  transform: async ({ _meta, content: _content, ...project }) => ({
    ...project,
    slug: _meta.path,
  }),
});

export default defineConfig({
  content: [posts, projects],
});
