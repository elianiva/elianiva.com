import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import yaml from "yaml";
import sites from "../src/data/sites";
import { escapeXml } from "../src/lib/xml";
import { OgImage } from "../src/features/og-image/lib/og-image";

/**
 * Build-time static assets for the prerendered site.
 *
 * TanStack Start owns the HTML: `spa.enabled` + `prerender.crawlLinks`
 * emits one static page per route (dynamic slugs included) plus the
 * `_shell.html` fallback and `sitemap.xml`. What Start cannot emit lives
 * here instead — `/robots.txt`, `/rss.xml`, and the OG images — as plain
 * file builders run from `scripts/build-static-assets.ts` after
 * `vp build`, writing straight into `dist/client`.
 *
 * Content metadata comes straight from the MDX frontmatter in
 * `src/content/{posts,projects}` — the same directories
 * `content-collections.config.ts` reads — parsed with `yaml`. The OG cards
 * reuse the real `OgImage` components rendered with `takumi-js/node` and
 * the brand fonts in `public/assets/fonts`, so the cards cannot drift from
 * the components.
 *
 * Import discipline matters here: `scripts/build-static-assets.ts` runs
 * under `tsx` with the `~/*` path alias, while this module keeps relative
 * imports so the pure builders stay importable from tests.
 */

export type ContentMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  hidden: boolean;
  type?: string;
  stack?: string[][];
};

const FEED_LIMIT = 20;

function parseFrontmatter<T>(file: string): T {
  const raw = readFileSync(file, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`Missing frontmatter: ${file}`);
  return yaml.parse(match[1]) as T;
}

function frontmatterString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

export function readContent(root: string): {
  posts: ContentMeta[];
  ogPosts: ContentMeta[];
  projects: ContentMeta[];
} {
  const read = (dir: string, extra: (fm: Record<string, unknown>) => Partial<ContentMeta>) => {
    const dirPath = path.join(root, "src/content", dir);
    return readdirSync(dirPath)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => {
        const fm = parseFrontmatter<Record<string, unknown>>(path.join(dirPath, f));
        const slug = f.replace(/\.mdx$/, "");
        return {
          slug,
          title: frontmatterString(fm.title, slug),
          date: frontmatterString(fm.date, "1970-01-01"),
          description: frontmatterString(fm.description, ""),
          tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
          hidden: fm.hidden === true,
          ...extra(fm),
        } satisfies ContentMeta;
      });
  };
  const byDateDesc = (a: ContentMeta, b: ContentMeta) => b.date.localeCompare(a.date);
  // Hidden posts stay directly routable (see `getPost`), so they get OG
  // cards — but they stay out of the feed.
  const ogPosts = read("posts", () => ({})).sort(byDateDesc);
  const posts = ogPosts.filter((p) => !p.hidden);
  const projects = read("projects", (fm) => ({
    type: typeof fm.type === "string" ? fm.type : undefined,
    stack: Array.isArray(fm.stack) ? (fm.stack as string[][]) : undefined,
  })).sort(byDateDesc);
  return { posts, ogPosts, projects };
}

export function buildRobots(siteUrl: string): string {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    "# Disallow dynamic API endpoints from crawling",
    "Disallow: /api/",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}

export type FeedItem = {
  title: string;
  url: string;
  date: string;
  description: string;
  categories: string[];
};

export function buildRss(
  siteName: string,
  siteUrl: string,
  description: string,
  posts: ContentMeta[],
  projects: ContentMeta[],
): string {
  const items: FeedItem[] = [
    ...posts.map((post) => ({
      title: post.title,
      url: `${siteUrl}/posts/${post.slug}`,
      date: post.date,
      description: post.description,
      categories: post.tags,
    })),
    ...projects.map((project) => ({
      title: project.title,
      url: `${siteUrl}/projects/${project.slug}`,
      date: project.date,
      description: project.description,
      categories: [] as string[],
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, FEED_LIMIT);

  const channelItems = items
    .map((item) => {
      // oxlint-disable-next-line efx-no-native-date
      const pubDate = new Date(`${item.date}T00:00:00Z`).toUTCString();
      const cats = item.categories.map((cat) => `<category>${escapeXml(cat)}</category>`).join("");
      return `<item><title>${escapeXml(item.title)}</title><link>${escapeXml(item.url)}</link><guid>${escapeXml(item.url)}</guid><pubDate>${pubDate}</pubDate><description>${escapeXml(item.description)}</description>${cats}</item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeXml(siteName)}</title><link>${siteUrl}</link><description>${escapeXml(description)}</description><language>en</language><atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />${channelItems}</channel></rss>`;
}

export type OgSpec =
  | { type: "default"; title: string; subtitle?: string; file: string }
  | {
      type: "post";
      title: string;
      date: string;
      tags: string[];
      description: string;
      file: string;
    };

/** Every OG image the site references. `seo.ts` builds URLs from `file`. */
export function ogSpecs(
  posts: ContentMeta[],
  projects: ContentMeta[],
  pages: { title: string; subtitle: string; file: string }[],
): OgSpec[] {
  return [
    ...pages.map((p) => ({
      type: "default" as const,
      title: p.title,
      subtitle: p.subtitle,
      file: p.file,
    })),
    ...posts.map((p) => ({
      type: "post" as const,
      title: p.title,
      date: p.date,
      tags: p.tags,
      description: p.description,
      file: `posts/${p.slug}.png`,
    })),
    ...projects.map((p) => ({
      type: "post" as const,
      title: p.title,
      date: p.date,
      tags: [],
      description: p.description,
      file: `projects/${p.slug}.png`,
    })),
  ];
}

/**
 * Renders every OG card with Takumi in this same process.
 */
export async function renderOgImages(root: string, outDir: string, specs: OgSpec[]) {
  const [{ Renderer }, { fromJsx }, React] = await Promise.all([
    import("takumi-js/node"),
    import("takumi-js/helpers/jsx"),
    import("react"),
  ]);
  const renderer = new Renderer();
  const fontsDir = path.join(root, "public/assets/fonts");
  const fonts = [
    { file: "google-sans.ttf", name: "Google Sans" },
    { file: "ibm-plex-mono.ttf", name: "IBM Plex Mono" },
  ].map(({ file, name }) => ({ data: readFileSync(path.join(fontsDir, file)), name }));
  const ogDir = path.join(outDir, "assets/og");
  mkdirSync(ogDir, { recursive: true });
  for (const spec of specs) {
    const { file, ...imageSpec } = spec;
    const element = React.createElement(OgImage, { spec: imageSpec });
    const { node, css } = await fromJsx(element);
    const png = await renderer.render(node, {
      width: 1200,
      height: 630,
      css,
      fonts,
      format: "png",
    });
    const target = path.join(ogDir, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, png);
  }
}

export const OG_PAGES = [
  { title: "elianiva", subtitle: "software engineer · open source", file: "home.png" },
  { title: "Posts", subtitle: "All blog posts", file: "posts.png" },
  { title: "Projects", subtitle: "Things I've built", file: "projects.png" },
  { title: "Uses", subtitle: "Stuff I actually use", file: "uses.png" },
  { title: "Neighbours", subtitle: "Cool people I know on the web", file: "neighbours.png" },
  { title: "Music", subtitle: "Recently played tracks via Last.fm", file: "music.png" },
];

/**
 * Emits the non-Start static assets into the client outDir:
 * `robots.txt`, `rss.xml`, and the OG images.
 */
export async function emitStaticAssets(root: string, outDir: string) {
  const { posts, ogPosts, projects } = readContent(root);
  writeFileSync(path.join(outDir, "robots.txt"), buildRobots(sites.siteUrl));
  writeFileSync(
    path.join(outDir, "rss.xml"),
    buildRss(sites.siteName, sites.siteUrl, sites.description, posts, projects),
  );
  await renderOgImages(root, outDir, ogSpecs(ogPosts, projects, OG_PAGES));
}
