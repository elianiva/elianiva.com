import { createFileRoute } from "@tanstack/react-router";
import { allPosts, allProjects } from "content-collections";
import { loadNotes } from "~/lib/notes";
import sites from "~/data/sites";

export const Route = createFileRoute("/api/sitemap/xml")({
  server: {
    handlers: {
      GET: async () => {
        const notes = await loadNotes();
        const urls = [
          "/",
          "/posts",
          "/notes",
          "/projects",
          ...allPosts.filter((p) => !p.draft).map((p) => "/posts/" + p.slug),
          ...notes.map((n) => "/notes/" + n.slug),
          ...allProjects.map((p) => "/projects/" + p.slug),
        ];
        const xml =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
          urls.map((u) => "<url><loc>" + sites.siteUrl + u + "</loc></url>").join("") +
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
