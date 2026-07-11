import { createFileRoute } from "@tanstack/react-router";
import sites from "~/data/sites";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          [
            "User-agent: *",
            "Allow: /",
            "",
            "# Disallow dynamic API endpoints from crawling",
            "Disallow: /api/",
            "",
            `Sitemap: ${sites.siteUrl}/sitemap.xml`,
            "",
          ].join("\n"),
          {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "public, max-age=86400",
            },
          },
        ),
    },
  },
});
