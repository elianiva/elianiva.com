import { createFileRoute } from "@tanstack/react-router";
import { allPosts, allProjects } from "content-collections";
import { listPosts } from "~/features/content/lib/posts";
import { listProjects } from "~/features/content/lib/projects";
import sites from "~/data/sites";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: { loc: string; lastmod?: string; changefreq: string; priority: string }[] = [
          { loc: "/", changefreq: "weekly", priority: "1.0" },
          { loc: "/posts", changefreq: "weekly", priority: "0.8" },
          { loc: "/projects", changefreq: "monthly", priority: "0.8" },
          { loc: "/photography", changefreq: "monthly", priority: "0.6" },
          { loc: "/neighbours", changefreq: "monthly", priority: "0.5" },
          { loc: "/ai", changefreq: "monthly", priority: "0.4" },
          { loc: "/music", changefreq: "daily", priority: "0.3" },
        ];

        for (const post of listPosts(allPosts)) {
          entries.push({
            loc: `/posts/${post.slug}`,
            lastmod: new Date(post.date).toISOString(),
            changefreq: "yearly",
            priority: "0.7",
          });
        }

        for (const project of listProjects(allProjects)) {
          entries.push({
            loc: `/projects/${project.slug}`,
            lastmod: new Date(project.date).toISOString(),
            changefreq: "yearly",
            priority: "0.6",
          });
        }

        const xml =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
          entries
            .map((entry) => {
              const loc = escapeXml(sites.siteUrl + entry.loc);
              const lastmod = entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "";
              return `<url><loc>${loc}</loc>${lastmod}<changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`;
            })
            .join("") +
          "</urlset>";

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
