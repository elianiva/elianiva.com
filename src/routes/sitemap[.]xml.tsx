import { createFileRoute } from "@tanstack/react-router";
import { allPosts, allProjects } from "content-collections";
import { loadNotes } from "~/features/notes/lib/notes";
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
        const notes = await loadNotes();
        const urls = [
          "/",
          "/posts",
          "/notes",
          "/projects",
          ...allPosts.reduce<string[]>((acc, p) => {
            if (!p.hidden) acc.push("/posts/" + p.slug);
            return acc;
          }, []),
          ...notes.map((n) => "/notes/" + n.slug),
          ...allProjects.map((p) => "/projects/" + p.slug),
        ];
        const xml =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
          urls.map((u) => "<url><loc>" + escapeXml(sites.siteUrl + u) + "</loc></url>").join("") +
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
