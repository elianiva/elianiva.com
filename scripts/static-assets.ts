import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import yaml from "yaml";
import sites from "../app/data/sites";
import { profile } from "../app/data/profile";
import { work } from "../app/data/work-experience";
import { openSource, prUrl } from "../app/data/open-source";
import { escapeXml } from "../app/lib/xml";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, ogImage } from "../app/og/og-image";

/**
 * Build-time static assets for the prerendered site.
 *
 * The Effect UI plugin owns the HTML: it prerenders each path in
 * `app/entry.server.ts` into the client `outDir`. What it does not emit lives
 * here instead: `/robots.txt`, `/llms.txt`, `/rss.xml`, `/sitemap.xml`, and the
 * OG images. `emitStaticAssets` in `vite.config.ts` runs this after the
 * prerender, writing into the same `outDir`.
 *
 * Content metadata comes straight from the Markdown frontmatter in
 * `CONTENT_DIR/{posts,projects}`, parsed with `yaml`. The OG cards are Takumi
 * node trees from `app/og` rendered with the brand fonts in
 * `public/assets/fonts`.
 *
 * Imports stay relative so the pure builders stay importable from tests and
 * from the Vite config.
 */

/** Where the Markdown content lives, relative to the project root. */
export const CONTENT_DIR = "app/content";

export type ContentMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  hidden: boolean;
  type?: string | undefined;
  featured?: boolean | undefined;
  stack?: string[][] | undefined;
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
    const dirPath = path.join(root, CONTENT_DIR, dir);
    return readdirSync(dirPath)
      .filter((f) => f.endsWith(".md"))
      .map((f) => {
        const fm = parseFrontmatter<Record<string, unknown>>(path.join(dirPath, f));
        const slug = f.replace(/\.md$/, "");
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
    featured: fm.featured === true,
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

/**
 * `/llms.txt`: the site as plain Markdown for agents and recruiter tooling
 * that never run the page's JavaScript. Roles come from the same
 * `work-experience` records the site and CV print, so nothing is written twice.
 */
export function buildLlmsTxt(
  siteUrl: string,
  roles: typeof work,
  posts: ContentMeta[],
  projects: ContentMeta[],
): string {
  const period = ([from, to]: readonly [string, string | null]) => `${from} to ${to ?? "present"}`;
  const link = (kind: "posts" | "projects", item: ContentMeta) =>
    `- [${item.title}](${siteUrl}/${kind}/${item.slug}): ${item.description}`;
  return [
    `# ${profile.name} (${profile.handle})`,
    "",
    `> Product engineer, mostly web, based in ${profile.location} and working remotely.`,
    "",
    "## Contact",
    "",
    `- Email: ${profile.email}`,
    `- GitHub: ${profile.urls.github}`,
    `- LinkedIn: ${profile.urls.linkedin}`,
    `- CV (PDF): ${siteUrl}${sites.cv}`,
    "",
    "## Experience",
    "",
    ...roles
      .filter((role) => role.cv)
      .map((role) => `- ${role.position}, ${role.company} (${role.time}, ${period(role.period)})`),
    "",
    "## Projects",
    "",
    ...projects.filter((p) => p.featured).map((p) => link("projects", p)),
    "",
    "## Open source",
    "",
    ...openSource.flatMap((entry) => [
      `- ${entry.repo}: ${entry.about}`,
      ...entry.prs.map((pr) => `  - [#${pr.number}](${prUrl(entry.repo, pr.number)}): ${pr.note}`),
    ]),
    "",
    "## Posts",
    "",
    ...posts.map((p) => link("posts", p)),
    "",
    "## Optional",
    "",
    `- [Uses](${siteUrl}/uses): hardware, software, and the coding agents I use`,
    `- [All projects](${siteUrl}/projects)`,
    `- [All posts](${siteUrl}/posts)`,
    "",
  ].join("\n");
}

/**
 * `/sitemap.xml`: one `<url>` per page, the shape TanStack Start emitted
 * before. `lastmod` is the build date.
 */
export function buildSitemap(siteUrl: string, paths: string[], lastmod: string): string {
  const urls = paths
    .map(
      (p) =>
        `  <url>\n    <loc>${escapeXml(siteUrl + (p === "/" ? "/" : p))}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * The pages the site prerenders: the `prerender` list in `app/entry.server.ts`
 * plus a page per non-hidden post and per project. Posts join the list by slug
 * so the sitemap stays complete before their pages prerender.
 */
export function sitemapPaths(
  root: string,
  posts: ContentMeta[],
  projects: ContentMeta[],
): string[] {
  const entry = readFileSync(path.join(root, "app/entry.server.ts"), "utf8");
  const list = /export const pages\s*=\s*\[([^\]]*)\]/.exec(entry);
  if (!list) throw new Error("app/entry.server.ts has no `pages` list");
  const fixed = [...list[1]!.matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
  return [
    ...new Set([
      ...fixed,
      // Linked from every page, so the old crawl listed them too.
      sites.cv,
      "/rss.xml",
      ...posts.map((p) => `/posts/${p.slug}`),
      ...projects.map((p) => `/projects/${p.slug}`),
    ]),
  ];
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
  const siteHref = `${siteUrl.replace(/\/+$/, "")}/`;
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
      return `<item><title>${escapeXml(item.title)}</title><link>${escapeXml(item.url)}</link><guid isPermaLink="true">${escapeXml(item.url)}</guid><pubDate>${pubDate}</pubDate><description>${escapeXml(item.description)}</description>${cats}</item>`;
    })
    .join("");

  // The feed changes when its newest item does, so the build date stays
  // reproducible instead of changing on every deploy.
  // oxlint-disable-next-line efx-no-native-date
  const lastBuildDate = items[0]
    ? new Date(`${items[0].date}T00:00:00Z`).toUTCString()
    : // oxlint-disable-next-line efx-no-native-date
      new Date(0).toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeXml(siteName)}</title><link>${escapeXml(siteHref)}</link><description>${escapeXml(description)}</description><language>en</language><generator>${escapeXml(siteHref)}</generator><lastBuildDate>${lastBuildDate}</lastBuildDate><atom:link href="${escapeXml(`${siteHref}rss.xml`)}" rel="self" type="application/rss+xml" />${channelItems}</channel></rss>`;
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
  const { Renderer } = await import("takumi-js/node");
  const domain = new URL(sites.siteUrl).hostname;
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
    const png = await renderer.render(ogImage(imageSpec, domain), {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
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
  { title: "Work", subtitle: "Experience and open source", file: "work.png" },
  { title: "Uses", subtitle: "Stuff I actually use", file: "uses.png" },
  { title: "Neighbours", subtitle: "Cool people I know on the web", file: "neighbours.png" },
  { title: "Music", subtitle: "Recently played tracks via Last.fm", file: "music.png" },
];

/**
 * Emits the non-Start static assets into the client outDir:
 * `robots.txt`, `llms.txt`, `rss.xml`, `sitemap.xml`, and the OG images.
 */
export async function emitStaticAssets(root: string, outDir: string) {
  const { posts, ogPosts, projects } = readContent(root);
  writeFileSync(path.join(outDir, "robots.txt"), buildRobots(sites.siteUrl));
  writeFileSync(path.join(outDir, "llms.txt"), buildLlmsTxt(sites.siteUrl, work, posts, projects));
  writeFileSync(
    path.join(outDir, "rss.xml"),
    buildRss(sites.siteName, sites.siteUrl, sites.description, posts, projects),
  );
  writeFileSync(
    path.join(outDir, "sitemap.xml"),
    // oxlint-disable-next-line efx-no-native-date
    buildSitemap(
      sites.siteUrl,
      sitemapPaths(root, posts, projects),
      new Date().toISOString().slice(0, 10),
    ),
  );
  await renderOgImages(root, outDir, ogSpecs(ogPosts, projects, OG_PAGES));
}
