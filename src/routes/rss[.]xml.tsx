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
          .map(
            (item) =>
              "<item><title>" +
              escapeXml(item.title) +
              "</title><link>" +
              escapeXml(item.url) +
              "</link><guid>" +
              escapeXml(item.url) +
              "</guid><pubDate>" +
              new Date(item.date).toUTCString() +
              "</pubDate><description>" +
              escapeXml(item.description) +
              "</description>" +
              item.categories.map((cat) => "<category>" + escapeXml(cat) + "</category>").join("") +
              "</item>",
          )
          .join("");

        const xml =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">' +
          "<channel>" +
          "<title>" +
          escapeXml(sites.siteName) +
          "</title>" +
          "<link>" +
          sites.siteUrl +
          "</link>" +
          "<description>" +
          escapeXml(sites.description) +
          "</description>" +
          "<language>en</language>" +
          '<atom:link href="' +
          sites.siteUrl +
          '/rss.xml" rel="self" type="application/rss+xml" />' +
          channelItems +
          "</channel></rss>";

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
