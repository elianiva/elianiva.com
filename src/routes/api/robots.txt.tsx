import { createFileRoute } from "@tanstack/react-router";
import sites from "~/data/sites";

export const Route = createFileRoute("/api/robots/txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response("User-agent: *\nAllow: /\nSitemap: " + sites.siteUrl + "/api/sitemap.xml\n", {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        }),
    },
  },
});
