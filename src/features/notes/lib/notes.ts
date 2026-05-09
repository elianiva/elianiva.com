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
    const fileResults = await Promise.all(
      allFiles.map(async (filePath) => {
        try {
          const [content, stat] = await Promise.all([
            fs.readFile(filePath, "utf-8"),
            fs.stat(filePath),
          ]);
          const parsed = matter(content);
          const tags = Array.isArray(parsed.data.tags)
            ? parsed.data.tags.map((t: unknown) => String(t))
            : [];

          if (!tags.includes("public")) return null;

          const relPath = path.relative(notesPath, filePath);
          const slug = parsed.data.slug || slugifyFilename(path.basename(filePath));
          const wikiLinks = extractWikiLinks(parsed.content);
          const category = getCategoryFromPath(relPath);

          const hasH1 = parsed.content.trim().startsWith("#");
          const description = hasH1 ? extractDescription(parsed.content) : "";
          const { url: parsedUrl, title: parsedTitle, id: parsedId, description: parsedDesc, created_at: createdAt, date: parsedDate, author: parsedAuthor, links: parsedLinks, artist: parsedArtist, album: parsedAlbum, year: parsedYear } = parsed.data;

          return { slug, relPath, wikiLinks, category, hasH1, description, parsedUrl, parsedTitle, parsedId, parsedDesc, createdAt, parsedDate, parsedAuthor, parsedLinks, parsedArtist, parsedAlbum, parsedYear, stat, content, filePath };
        } catch (err) {
          console.error(`Error loading ${filePath}:`, err);
          return null;
        }
      }),
    );

    for (const result of fileResults) {
      if (!result) continue;
      const { slug, wikiLinks, category, description, parsedUrl, parsedTitle, parsedId, parsedDesc, createdAt, parsedDate, parsedAuthor, parsedLinks, parsedArtist, parsedAlbum, parsedYear, stat } = result;

      notes.push({
        id: slug,
          slug,
          title: parsedTitle || parsedId || slug,
          description: parsedDesc || description,
          content: parsed.content,
          category,
          tags,
          date: createdAt || parsedDate || stat.birthtime.toISOString(),
          modifiedAt: stat.mtime.toISOString(),
          backlinks: [],
          outboundLinks: wikiLinks,
          isPublic: true,
          domain: parsedUrl
            ? new URL(parsedUrl).hostname.replace(/^www\./, "")
            : undefined,
          url: parsedUrl,
          author: parsedAuthor,
          links: parsedLinks,
          artist: parsedArtist,
          album: parsedAlbum,
          year: parsedYear
            ? Array.isArray(parsedYear)
              ? parsedYear
              : [parsedYear]
            : undefined,
        });
      } catch (err) {
        console.error(`Error loading ${filePath}:`, err);
      }
    }

    // Build backlinks
    const slugMap = new Map(notes.map((n) => [n.slug, n]));
    const titleToSlug = new Map(notes.map((n) => [n.title.toLowerCase(), n.slug]));
    const backlinkSets = new Map(notes.map((n) => [n.slug, new Set<string>()]));

    for (const note of notes) {
      for (const link of note.outboundLinks) {
        const targetSlug = titleToSlug.get(link.toLowerCase());
        if (targetSlug) {
          backlinkSets.get(targetSlug)?.add(note.slug);
        }
      }
    }

    for (const note of notes) {
      const set = backlinkSets.get(note.slug);
      if (set) note.backlinks = [...set];
    }

    return notes;
  } catch (error) {
    console.error("Failed to load notes from local FS:", error);
    return [];
  }
}

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
      (item) => item.type === "blob" && (item.path?.endsWith(".md") || item.path?.endsWith(".mdx")),
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
          const parsed = matter(content);
          const tags = Array.isArray(parsed.data.tags)
            ? parsed.data.tags.map((t: unknown) => String(t))
            : [];

          if (!tags.includes("public")) continue;

          const slug = parsed.data.slug || slugifyFilename(file.path.split("/").pop() || "");
          const wikiLinks = extractWikiLinks(parsed.content);
          const category = getCategoryFromPath(file.path);

          const hasH1 = parsed.content.trim().startsWith("#");
          const description = hasH1 ? extractDescription(parsed.content) : "";
          const { url: parsedUrl, title: parsedTitle, id: parsedId, description: parsedDesc, created_at: createdAt, date: parsedDate, author: parsedAuthor, links: parsedLinks, artist: parsedArtist, album: parsedAlbum, year: parsedYear } = parsed.data;

          notes.push({
            id: slug,
            slug,
            title: parsedTitle || parsedId || slug,
            description: parsedDesc || description,
            content: parsed.content,
            category,
            tags,
            date: createdAt || parsedDate || now,
            modifiedAt: now,
            backlinks: [],
            outboundLinks: wikiLinks,
            isPublic: true,
            domain: parsedUrl
              ? new URL(parsedUrl).hostname.replace(/^www\./, "")
              : undefined,
            url: parsedUrl,
            author: parsedAuthor,
            links: parsedLinks,
            artist: parsedArtist,
            album: parsedAlbum,
            year: parsedYear
              ? Array.isArray(parsedYear)
                ? parsedYear
                : [parsedYear]
              : undefined,
          });
        }
      } catch (err) {
        console.error(`Error fetching ${file.path}:`, err);
      }
    }

    const slugMap = new Map(notes.map((n) => [n.slug, n]));
    const titleToSlug = new Map(notes.map((n) => [n.title.toLowerCase(), n.slug]));
    const backlinkSets = new Map(notes.map((n) => [n.slug, new Set<string>()]));

    for (const note of notes) {
      for (const link of note.outboundLinks) {
        const targetSlug = titleToSlug.get(link.toLowerCase());
        if (targetSlug) {
          backlinkSets.get(targetSlug)?.add(note.slug);
        }
      }
    }

    for (const note of notes) {
      const set = backlinkSets.get(note.slug);
      if (set) note.backlinks = [...set];
    }

    return notes;
  } catch (error) {
    console.error("Failed to load notes from GitHub:", error);
    return [];
  }
}

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