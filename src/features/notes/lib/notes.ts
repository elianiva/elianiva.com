import { Context, Effect, Layer, Redacted } from "effect"
import { createServerFn } from "@tanstack/react-start"
import { Octokit } from "octokit"
import matter from "gray-matter"
import { AppRuntime } from "~/lib/effect"
import { GH_TOKEN, NOTES_OWNER, NOTES_REPO, NOTES_BRANCH } from "~/lib/env"
import * as E from "~/lib/errors"
import type { Note, NoteCategory, NotesGraph } from "./types"

function extractWikiLinks(content: string): string[] {
  const links: string[] = [];
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].replace(/\|.*$/, "").trim());
  }
  return [...new Set(links)];
}

function extractDescription(content: string): string {
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith("*") &&
      !trimmed.startsWith("[") &&
      !trimmed.startsWith("!")
    ) {
      return trimmed.slice(0, 200);
    }
  }
  return "";
}

function slugifyFilename(filename: string): string {
  return filename
    .replace(/\.mdx?$/, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

function getCategoryFromPath(filePath: string): NoteCategory {
  const topDir = filePath.split("/")[0]?.toLowerCase();
  switch (topDir) {
    case "articles":
      return "articles";
    case "people":
      return "people";
    case "music":
      return "music";
    default:
      return "vault";
  }
}

type ParseExtra = {
  date?: string;
  modifiedAt?: string;
};

function parseNoteFromRaw(relPath: string, content: string, extra: ParseExtra): Note | null {
  const parsed = matter(content);
  const tags = Array.isArray(parsed.data.tags)
    ? parsed.data.tags.map((t: unknown) => String(t))
    : [];

  if (!tags.includes("public")) return null;

  const filename = relPath.split("/").pop() || "";
  const slug = parsed.data.slug || slugifyFilename(filename);
  const wikiLinks = extractWikiLinks(parsed.content);
  const category = getCategoryFromPath(relPath);
  const hasH1 = parsed.content.trim().startsWith("#");
  const description = hasH1 ? extractDescription(parsed.content) : "";

  const d = parsed.data as Record<string, unknown>;
  const title = String(d.title ?? d.id ?? slug);
  const parsedDesc = d.description ? String(d.description) : "";
  const url = d.url ? String(d.url) : undefined;
  const author = d.author ? String(d.author) : undefined;
  const links = Array.isArray(d.links) ? d.links.map(String) : undefined;
  const artist = d.artist ? String(d.artist) : undefined;
  const album = d.album ? String(d.album) : undefined;
  const year = d.year
    ? Array.isArray(d.year)
      ? d.year
      : [d.year]
    : undefined;

  return {
    id: slug,
    slug,
    title,
    description: parsedDesc || description,
    content: parsed.content,
    category,
    tags,
    date: String(d.created_at ?? d.date ?? extra.date ?? new Date().toISOString()),
    modifiedAt: extra.modifiedAt,
    backlinks: [],
    outboundLinks: wikiLinks,
    isPublic: true,
    domain: url ? new URL(url).hostname.replace(/^www\./, "") : undefined,
    url,
    author,
    links,
    artist,
    album,
    year,
  };
}

function resolveBacklinks(notes: Note[]): Note[] {
  const slugMap = new Map(notes.map((n) => [n.slug, n]));
  const backlinkSets = new Map(notes.map((n) => [n.slug, new Set<string>()]));

  for (const note of notes) {
    for (const link of note.outboundLinks) {
      const targetSlug = link.toLowerCase().replace(/\s+/g, "-");
      if (slugMap.has(targetSlug)) {
        backlinkSets.get(targetSlug)?.add(note.slug);
      }
    }
  }

  for (const note of notes) {
    const set = backlinkSets.get(note.slug);
    if (set) note.backlinks = [...set];
  }

  return notes;
}

// ── Local FS loader (dev) ────────────────────────────────────────

function loadNotesFromLocalFS(): Effect.Effect<Note[], E.NotesError> {
  return Effect.gen(function*() {
    const { promises: fsp } = yield* Effect.promise(() => import("node:fs"))
    const { homedir } = yield* Effect.promise(() => import("node:os"))
    const { join, relative } = yield* Effect.promise(() => import("node:path"))

    const notesPath = join(homedir(), "Development/personal/notes")

    const allFiles: string[] = []
    const excludeDirs = new Set(["Archive", "Daily", "Inbox"])

    const scanDir = (dir: string): Effect.Effect<void, E.NotesError> =>
      Effect.gen(function*() {
        const entries = yield* Effect.tryPromise({
          try: () => fsp.readdir(dir, { withFileTypes: true }),
          catch: (e) => new E.NotesError({ message: `readdir error ${dir}: ${String(e)}` }),
        })
        for (const entry of entries) {
          const fullPath = join(dir, entry.name)
          if (entry.isDirectory()) {
            if (!excludeDirs.has(entry.name)) {
              yield* scanDir(fullPath)
            }
          } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
            allFiles.push(fullPath)
          }
        }
      })

    yield* scanDir(notesPath)

    const notes: Note[] = []
    const errors: string[] = []

    for (const filePath of allFiles) {
      const result = yield* Effect.gen(function*() {
        const relPath = relative(notesPath, filePath)
        const content = yield* Effect.tryPromise({
          try: () => fsp.readFile(filePath, "utf-8") as Promise<string>,
          catch: () => "" as string,
        })
        if (!content) return null
        const stat = yield* Effect.tryPromise({
          try: () => fsp.stat(filePath),
          catch: () => undefined as import("node:fs").Stats | undefined,
        })
        return parseNoteFromRaw(relPath, content, {
          date: stat?.birthtime ? stat.birthtime.toISOString() : new Date().toISOString(),
          modifiedAt: stat?.mtime ? stat.mtime.toISOString() : undefined,
        })
      }).pipe(
        Effect.catchCause((cause) => {
          errors.push(String(cause))
          return Effect.succeed(null as Note | null)
        }),
      )
      if (result) notes.push(result)
    }

    return resolveBacklinks(notes)
  })
}

// ── GitHub loader (prod) ─────────────────────────────────────────

function loadNotesFromGithub(ghToken: string, owner: string, repo: string, branch: string): Effect.Effect<Note[], E.NotesError> {
  return Effect.gen(function*() {
    const octokit = new Octokit({ auth: ghToken })

    const { data: treeData } = yield* Effect.tryPromise({
      try: () => octokit.rest.git.getTree({ owner, repo, tree_sha: branch, recursive: "true" }),
      catch: (e) => new E.NotesError({ message: `Failed to get tree: ${String(e)}` }),
    })

    const mdFiles = treeData.tree.filter(
      (item) =>
        item.type === "blob" &&
        (item.path?.endsWith(".md") || item.path?.endsWith(".mdx")),
    )

    const notes: Note[] = []
    const now = new Date().toISOString()

    for (const file of mdFiles) {
      if (!file.path) continue
      const note = yield* Effect.gen(function*() {
        const { data: fileData } = yield* Effect.tryPromise({
          try: () => octokit.rest.repos.getContent({ owner, repo, path: file.path, ref: branch }),
          catch: () => undefined as { content?: string } | undefined,
        })
        if (!fileData || !("content" in fileData)) return null
        const content = Buffer.from(fileData.content, "base64").toString("utf-8")
        return parseNoteFromRaw(file.path, content, { date: now })
      }).pipe(Effect.catchCause(() => Effect.succeed(null as Note | null)))
      if (note) notes.push(note)
    }

    return resolveBacklinks(notes)
  })
}

// ── Service ──────────────────────────────────────────────────────

export class Notes extends Context.Service<Notes, {
  readonly load: () => Effect.Effect<Note[], E.NotesError>
  readonly buildGraph: () => Effect.Effect<NotesGraph, E.NotesError>
}>()("Notes") {
  static readonly layer = Layer.effect(
    Notes,
    Effect.gen(function*() {
      const ghToken = Redacted.value(yield* GH_TOKEN)
      const owner = yield* NOTES_OWNER
      const repo = yield* NOTES_REPO
      const branch = yield* NOTES_BRANCH

      const load = Effect.fn("Notes.load")(function*() {
        if (import.meta.env.DEV) {
          return yield* loadNotesFromLocalFS().pipe(
            Effect.catchCause(() => Effect.succeed<Note[]>([])),
          )
        }
        return yield* loadNotesFromGithub(ghToken, owner, repo, branch).pipe(
          Effect.catchCause(() => Effect.succeed<Note[]>([])),
        )
      })

      const buildGraph = Effect.fn("Notes.buildGraph")(function*() {
        const notes = yield* load()
        const nodes = notes.map((note: Note) => ({
          id: note.slug,
          name: note.title,
          category: note.category,
          val: Math.max(4, note.backlinks.length + 2),
        }))

        const links: NotesGraph["links"] = []
        const seen = new Set<string>()

        for (const note of notes) {
          for (const link of note.outboundLinks) {
            const targetSlug = link.toLowerCase().replace(/\s+/g, "-")
            if (notes.some((n: Note) => n.slug === targetSlug)) {
              const key = [note.slug, targetSlug].sort().join("-")
              if (!seen.has(key)) {
                seen.add(key)
                links.push({ source: note.slug, target: targetSlug })
              }
            }
          }
        }

        return { nodes, links }
      })

      return { load, buildGraph }
    }),
  )
}

// ── Server functions ─────────────────────────────────────────────

export const loadNotes = createServerFn({ method: "GET" }).handler(() =>
  AppRuntime.runPromise(
    Effect.gen(function*() {
      const svc = yield* Notes
      return yield* svc.load()
    }),
  ),
)

export const buildGraph = createServerFn({ method: "GET" }).handler(() =>
  AppRuntime.runPromise(
    Effect.gen(function*() {
      const svc = yield* Notes
      return yield* svc.buildGraph()
    }),
  ),
)
