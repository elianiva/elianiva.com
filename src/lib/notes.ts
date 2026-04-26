import matter from "gray-matter";
import { env } from "#/env";
import type { Note, NoteCategory, NotesGraph } from "#/types/notes";
import { createServerFn } from "@tanstack/react-start";

function extractWikiLinks(content: string): string[] {
  const links: string[] = [];
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].replace(/\|.*$/, "").trim());
  }
  return [...new Set(links)];
}

function slugifyFilename(filename: string): string {
  return filename
    .replace(/\.mdx?$/, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

async function loadNotesFromLocalFS(): Promise<Note[]> {
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const os = await import("node:os");
    const notesPath = path.join(os.homedir(), "Development/personal/notes");
    
    const files = await fs.readdir(notesPath, { recursive: true });
    const mdFiles = files.filter(
      (f): f is string => typeof f === "string" && (f.endsWith(".md") || f.endsWith(".mdx")),
    );

    const notes: Note[] = [];
    for (const file of mdFiles) {
      const fullPath = path.join(notesPath, file);
      const content = await fs.readFile(fullPath, "utf-8");
      const parsed = matter(content);
      const tags = Array.isArray(parsed.data.tags)
        ? parsed.data.tags.map((t: unknown) => String(t))
        : [];

      if (!tags.includes("public")) continue;

      const slug = parsed.data.slug || slugifyFilename(path.basename(file));
      const wikiLinks = extractWikiLinks(parsed.content);

      notes.push({
        id: slug,
        slug,
        title: parsed.data.title || slug,
        description: parsed.data.description || "",
        content: parsed.content,
        category: (parsed.data.category || "vault") as NoteCategory,
        tags,
        date: parsed.data.date || new Date().toISOString(),
        backlinks: [],
        outboundLinks: wikiLinks,
        isPublic: true,
        domain: parsed.data.domain,
        artist: parsed.data.artist,
        album: parsed.data.album,
        year: parsed.data.year,
      });
    }

    // Build backlinks
    const slugMap = new Map(notes.map((n) => [n.slug, n]));
    for (const note of notes) {
      for (const link of note.outboundLinks) {
        const target = slugMap.get(link.toLowerCase().replace(/\s+/g, "-"));
        if (target) {
          target.backlinks.push(note.slug);
        }
      }
    }

    return notes;
  } catch (error) {
    console.error("Failed to load notes from local FS:", error);
    return [];
  }
}

async function loadNotesFromGithub(): Promise<Note[]> {
  const { Octokit } = await import("octokit");
  const token = env.GH_TOKEN;
  if (!token) {
    console.warn("GH_TOKEN not set, cannot load notes from GitHub");
    return [];
  }

  const octokit = new Octokit({ auth: token });
  const owner = env.NOTES_OWNER || "elianiva";
  const repo = env.NOTES_REPO || "notes";
  const branch = env.NOTES_BRANCH || "main";

  try {
    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "true",
    });

    const mdFiles = treeData.tree.filter(
      (item) => item.type === "blob" && (item.path?.endsWith(".md") || item.path?.endsWith(".mdx")),
    );

    const notes: Note[] = [];
    for (const file of mdFiles) {
      if (!file.path) continue;
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: file.path,
        ref: branch,
      });

      if ("content" in fileData) {
        const content = Buffer.from(fileData.content, "base64").toString("utf-8");
        const parsed = matter(content);
        const tags = Array.isArray(parsed.data.tags)
          ? parsed.data.tags.map((t: unknown) => String(t))
          : [];

        if (!tags.includes("public")) continue;

        const slug = parsed.data.slug || slugifyFilename(file.path.split("/").pop() || "");
        const wikiLinks = extractWikiLinks(parsed.content);

        notes.push({
          id: slug,
          slug,
          title: parsed.data.title || slug,
          description: parsed.data.description || "",
          content: parsed.content,
          category: (parsed.data.category || "vault") as NoteCategory,
          tags,
          date: parsed.data.date || new Date().toISOString(),
          backlinks: [],
          outboundLinks: wikiLinks,
          isPublic: true,
          domain: parsed.data.domain,
          artist: parsed.data.artist,
          album: parsed.data.album,
          year: parsed.data.year,
        });
      }
    }

    // Build backlinks
    const slugMap = new Map(notes.map((n) => [n.slug, n]));
    for (const note of notes) {
      for (const link of note.outboundLinks) {
        const target = slugMap.get(link.toLowerCase().replace(/\s+/g, "-"));
        if (target) {
          target.backlinks.push(note.slug);
        }
      }
    }

    return notes;
  } catch (error) {
    console.error("Failed to load notes from GitHub:", error);
    return [];
  }
}

export const loadNotes = createServerFn({ method: "GET" })
  .handler(async () => {
    // In development, try local filesystem first
    if (process.env.NODE_ENV === "development") {
      const localNotes = await loadNotesFromLocalFS();
      if (localNotes.length > 0) return localNotes;
    }
    return loadNotesFromGithub();
  });

export const buildGraph = createServerFn({ method: "GET" })
  .handler(async () => {
    const notes = await loadNotes();
    const nodes = notes.map((note) => ({
      id: note.slug,
      name: note.title,
      category: note.category,
      val: 1 + note.backlinks.length * 0.5,
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
