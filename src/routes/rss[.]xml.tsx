import { createFileRoute } from "@tanstack/react-router";
import { allPosts, allProjects } from "content-collections";
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
        const posts = allPosts.filter((p) => !p.hidden).sort((a, b) => b.date.localeCompare(a.date));
        const projects = allProjects.sort((a, b) => b.date.localeCompare(a.date));
        const items = [
          ...posts.map((post) => ({
            title: post.title,
            url: sites.siteUrl + "/posts/" + post.slug,
            date: post.date,
            description: post.description,
          })),
          ...projects.map((project) => ({
            title: project.title,
            url: sites.siteUrl + "/projects/" + project.slug,
            date: project.date,
            description: project.description,
          })),
        ];
        const xml =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<rss version="2.0"><channel>' +
          "<title>" +
          sites.siteName +
          "</title><link>" +
          sites.siteUrl +
          "</link><description>" +
          sites.description +
          "</description>" +
          items
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
                "</description></item>",
            )
            .join("") +
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
