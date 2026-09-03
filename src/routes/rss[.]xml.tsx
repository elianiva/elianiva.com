import { createFileRoute } from "@tanstack/react-router";
import { allPosts, allProjects } from "content-collections";
import { listPosts } from "~/features/content/lib/posts";
import { listProjects } from "~/features/content/lib/projects";
import * as DateTime from "effect/DateTime";
import sites from "~/data/sites";
import { escapeXml, xmlResponse } from "~/lib/xml";

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const items = [
          ...listPosts(allPosts).map((post) => ({
            title: post.title,
            url: `${sites.siteUrl}/posts/${post.slug}`,
            date: post.date,
            description: post.description,
            categories: post.tags,
          })),
          ...listProjects(allProjects).map((project) => ({
            title: project.title,
            url: `${sites.siteUrl}/projects/${project.slug}`,
            date: project.date,
            description: project.description,
            categories: [] as string[],
          })),
        ]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 20);

        const channelItems = items
          .map((item) => {
            const pubDate = DateTime.toDate(DateTime.makeUnsafe(item.date)).toUTCString();
            const cats = item.categories
              .map((cat) => `<category>${escapeXml(cat)}</category>`)
              .join("");
            return `<item><title>${escapeXml(item.title)}</title><link>${escapeXml(item.url)}</link><guid>${escapeXml(item.url)}</guid><pubDate>${pubDate}</pubDate><description>${escapeXml(item.description)}</description>${cats}</item>`;
          })
          .join("");

        const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeXml(sites.siteName)}</title><link>${sites.siteUrl}</link><description>${escapeXml(sites.description)}</description><language>en</language><atom:link href="${sites.siteUrl}/rss.xml" rel="self" type="application/rss+xml" />${channelItems}</channel></rss>`;

        return xmlResponse(xml, "application/rss+xml; charset=utf-8");
      },
    },
  },
});
