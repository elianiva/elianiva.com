import { markdown } from "@effect/ui/html/MarkdownVite";
import { readFileSync, readdirSync } from "node:fs";
import * as path from "node:path";
import type { Plugin } from "vite";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { Islands } from "../content/islands";

/**
 * Builds `virtual:content` from `app/content/{posts,projects}/*.md`: the
 * frontmatter of every file, checked here, and a lazy loader per file for its
 * body. A body is its own chunk, so a page fetches only the post it shows, and
 * the Markdown is parsed at build time, so no parser ships to the browser.
 *
 * Effect UI's Markdown frontmatter is flat strings only, and ours has lists
 * and nesting, so this plugin owns the frontmatter and hands the compiler the
 * body alone (the `?body` query).
 */
const ID = "virtual:content";
const RESOLVED = `\0${ID}`;
const BODY = "?body";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const post = z.object({
  title: z.string(),
  date,
  description: z.string(),
  tags: z.array(z.string()),
  hidden: z.boolean().optional().default(false),
});

/**
 * A project's place on the CV. Present means the recruiter's PDF prints it;
 * absent means the site lists it and the CV does not.
 */
const cvProject = z.object({
  period: z.tuple([z.string(), z.string().nullable()]),
  details: z.array(z.string()).min(1),
});

const project = z.object({
  title: z.string(),
  featured: z.boolean().optional().default(false),
  date,
  description: z.string(),
  source: z.url(),
  demo: z.url().optional().nullable(),
  type: z.enum(["personal", "open-source", "assignment"]),
  stack: z.array(z.tuple([z.string(), z.url()])),
  cv: cvProject.optional(),
  image: z.string().optional(),
});

/** Splits a file into its YAML frontmatter and its body. */
export function splitFrontmatter(source: string): { data: unknown; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) throw new Error("missing frontmatter");
  return {
    data: parseYaml(match[1] ?? "", { schema: "core" }),
    body: source.slice(match[0].length),
  };
}

function readCollection<S extends z.ZodType>(root: string, kind: string, schema: S) {
  const dir = path.join(root, "app/content", kind);
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => {
      const slug = file.slice(0, -3);
      const { data, body } = splitFrontmatter(readFileSync(path.join(dir, file), "utf8"));
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        throw new Error(`app/content/${kind}/${file}: ${z.prettifyError(parsed.error)}`);
      }
      return { file, slug, body, meta: parsed.data as Record<string, unknown> };
    });
}

export function content(): Plugin {
  const compile = markdown({ islands: Islands });
  let root = process.cwd();

  return {
    name: "content",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
    },
    resolveId(source) {
      return source === ID ? RESOLVED : undefined;
    },
    load(id) {
      if (id === RESOLVED) {
        const posts = readCollection(root, "posts", post);
        const projects = readCollection(root, "projects", project);
        this.addWatchFile(path.join(root, "app/content"));
        const loaders = (kind: string, entries: typeof posts) =>
          `{${entries
            .map(
              (e) =>
                `${JSON.stringify(e.slug)}: () => import(${JSON.stringify(`/app/content/${kind}/${e.file}${BODY}`)})`,
            )
            .join(",")}}`;
        return [
          `export const allPosts = ${JSON.stringify(
            posts.map((e) => ({
              ...e.meta,
              slug: e.slug,
              wordCount: e.body.replace(/^(#+\s*)/gm, "").split(/\s+/).length,
            })),
          )};`,
          `export const allProjects = ${JSON.stringify(
            projects.map((e) => ({ ...e.meta, slug: e.slug })),
          )};`,
          `export const postBodies = ${loaders("posts", posts)};`,
          `export const projectBodies = ${loaders("projects", projects)};`,
          `export const logoFiles = ${JSON.stringify(
            readdirSync(path.join(root, "public/assets/logo"))
              .filter((f) => f.endsWith(".webp"))
              .map((f) => f.slice(0, -".webp".length)),
          )};`,
        ].join("\n");
      }
      if (id.endsWith(`.md${BODY}`)) {
        const file = id.slice(0, -BODY.length);
        this.addWatchFile(file);
        const { body } = splitFrontmatter(readFileSync(file, "utf8"));
        const compiled = compile.transform(body, file);
        if (!compiled) throw new Error(`${file}: not compiled`);
        return compiled.code;
      }
      return undefined;
    },
  };
}
