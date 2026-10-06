import { describe, expect, it } from "vite-plus/test";
import { buildRobots, buildRss, ogSpecs, readContent, type ContentMeta } from "./static-assets";

const post: ContentMeta = {
  slug: "hello-world",
  title: "Hello <World>",
  date: "2026-01-15",
  description: "First & best",
  tags: ["intro", "meta<char>"],
  hidden: false,
};

const project: ContentMeta = {
  slug: "demo",
  title: "Demo",
  date: "2026-02-01",
  description: "A demo project",
  tags: [],
  hidden: false,
};

describe("readContent", () => {
  it("reads every collection document with frontmatter metadata", () => {
    const { posts, ogPosts, projects } = readContent(process.cwd());
    expect(posts.length).toBeGreaterThan(0);
    expect(ogPosts.length).toBeGreaterThanOrEqual(posts.length);
    expect(projects.length).toBeGreaterThan(0);
    for (const doc of [...posts, ...projects]) {
      expect(doc.title.length).toBeGreaterThan(0);
      expect(doc.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("keeps hidden posts out of the feed set but in the OG set", () => {
    const { posts, ogPosts } = readContent(process.cwd());
    expect(posts.every((p) => !p.hidden)).toBe(true);
    expect(ogPosts.length - posts.length).toBeGreaterThan(0);
  });

  it("sorts newest first", () => {
    const { posts } = readContent(process.cwd());
    const dates = posts.map((p) => p.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});

describe("buildRobots", () => {
  it("allows the site and points at the sitemap", () => {
    const robots = buildRobots("https://elianiva.com");
    expect(robots).toContain("User-agent: *\nAllow: /");
    expect(robots).toContain("Sitemap: https://elianiva.com/sitemap.xml");
  });
});

describe("buildRss", () => {
  it("merges posts and projects newest-first capped at twenty", () => {
    const xml = buildRss("Site", "https://elianiva.com", "Desc", [post], [project]);
    expect(xml).toContain('<rss version="2.0"');
    const demoAt = xml.indexOf("/projects/demo");
    const helloAt = xml.indexOf("/posts/hello-world");
    expect(demoAt).toBeGreaterThan(-1);
    expect(helloAt).toBeGreaterThan(-1);
    // 2026-02-01 sorts before 2026-01-15
    expect(demoAt).toBeLessThan(helloAt);
  });

  it("caps the feed at twenty items", () => {
    const many = Array.from({ length: 30 }, (_, i) => ({
      ...post,
      slug: `post-${i}`,
      date: `2026-03-${String((i % 28) + 1).padStart(2, "0")}`,
    }));
    const xml = buildRss("Site", "https://elianiva.com", "Desc", many, []);
    expect(xml.match(/<item>/g)).toHaveLength(20);
  });

  it("escapes item text", () => {
    const xml = buildRss("Site", "https://elianiva.com", "Desc", [post], []);
    expect(xml).toContain("First &amp; best");
    expect(xml).toContain("<category>meta&lt;char&gt;</category>");
  });
});

describe("ogSpecs", () => {
  it("covers pages, posts, and projects with distinct files", () => {
    const specs = ogSpecs([post], [project], [{ title: "Home", subtitle: "Hi", file: "home.png" }]);
    const files = specs.map((s) => s.file);
    expect(files).toContain("home.png");
    expect(files).toContain("posts/hello-world.png");
    expect(files).toContain("projects/demo.png");
    expect(new Set(files).size).toBe(files.length);
  });
});
