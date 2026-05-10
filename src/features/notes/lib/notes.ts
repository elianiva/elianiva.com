import matter from "gray-matter";
import type { Note, NoteCategory, NotesGraph } from "./types";
import { createServerFn } from "@tanstack/react-start";
import { createContentLoader } from "~/features/content/lib/content";

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

// ── Local FS loader ──────────────────────────────────────────────

async function loadNotesFromLocalFS(): Promise<Note[]> {
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const os = await import("node:os");
    const notesPath = path.join(os.homedir(), "Development/personal/notes");

    const allFiles: string[] = [];
    const excludeDirs = new Set(["Archive", "Daily", "Inbox"]);

    async function scanDir(dir: string): Promise<void> {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!excludeDirs.has(entry.name)) {
            await scanDir(fullPath);
          }
        } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
          allFiles.push(fullPath);
        }
      }
    }

    await scanDir(notesPath);

    const notes: Note[] = [];
    const errors: string[] = [];

    const results = await Promise.allSettled(
      allFiles.map(async (filePath) => {
        const relPath = path.relative(notesPath, filePath);
        const content = await fs.readFile(filePath, "utf-8");
        const stat = await fs.stat(filePath);
        return parseNoteFromRaw(relPath, content, {
          date: stat.birthtime.toISOString(),
          modifiedAt: stat.mtime.toISOString(),
        });
      }),
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        notes.push(result.value);
      } else if (result.status === "rejected") {
        errors.push(result.reason?.message ?? String(result.reason));
      }
    }

    if (errors.length > 0) {
      console.error("Errors loading notes:", errors);
    }

    return resolveBacklinks(notes);
  } catch (error) {
    console.error("Failed to load notes from local FS:", error);
    return [];
  }
}

// ── GitHub loader ────────────────────────────────────────────────

async function loadNotesFromGithub(): Promise<Note[]> {
  const { Octokit } = await import("octokit");
  const token = process.env.GH_TOKEN;
  if (!token) {
    console.warn("GH_TOKEN not set, cannot load notes from GitHub");
    return [];
  }

  const octokit = new Octokit({ auth: token });
  const owner = process.env.NOTES_OWNER || "elianiva";
  const repo = process.env.NOTES_REPO || "notes";
  const branch = process.env.NOTES_BRANCH || "main";

  try {
    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "true",
    });

    const mdFiles = treeData.tree.filter(
      (item) =>
        item.type === "blob" &&
        (item.path?.endsWith(".md") || item.path?.endsWith(".mdx")),
    );

    const notes: Note[] = [];
    const now = new Date().toISOString();

    for (const file of mdFiles) {
      if (!file.path) continue;
      try {
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: file.path,
          ref: branch,
        });

        if ("content" in fileData) {
          const content = Buffer.from(fileData.content, "base64").toString("utf-8");
          const note = parseNoteFromRaw(file.path, content, { date: now });
          if (note) notes.push(note);
        }
      } catch (err) {
        console.error(`Error fetching ${file.path}:`, err);
      }
    }

    return resolveBacklinks(notes);
  } catch (error) {
    console.error("Failed to load notes from GitHub:", error);
    return [];
  }
}

// ── Server functions ─────────────────────────────────────────────

export const loadNotes = createServerFn({ method: "GET" }).handler(async () => {
  return createContentLoader({
    dev: loadNotesFromLocalFS,
    prod: loadNotesFromGithub,
  });
});

export const buildGraph = createServerFn({ method: "GET" }).handler(async () => {
  const notes = await loadNotes();

  const nodes = notes.map((note) => ({
    id: note.slug,
    name: note.title,
    category: note.category,
    val: Math.max(4, note.backlinks.length + 2),
  }));

  const links: NotesGraph["links"] = [];
  const seen = new Set<string>();

  for (const note of notes) {
    for (const link of note.outboundLinks) {
      const targetSlug = link.toLowerCase().replace(/\s+/g, "-");
      if (notes.some((n) => n.slug === targetSlug)) {
        const key = [note.slug, targetSlug].sort().join("-");
        if (!seen.has(key)) {
          seen.add(key);
          links.push({ source: note.slug, target: targetSlug });
        }
      }
    }
  }

  return { nodes, links } as NotesGraph;
});
