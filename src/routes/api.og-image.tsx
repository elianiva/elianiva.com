import { createFileRoute } from "@tanstack/react-router";
import { renderOgImage, type OgImageSpec } from "~/features/og-image/lib/og-image";

const PNG_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800, immutable",
  "CDN-Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
};

function badRequest() {
  return new Response("Missing required query parameters", { status: 400 });
}

export const Route = createFileRoute("/api/og-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const type = url.searchParams.get("type") || "post";
        const title = url.searchParams.get("title");

        let spec: OgImageSpec;
        if (type === "default") {
          if (!title) return badRequest();
          const subtitle = url.searchParams.get("subtitle");
          spec = {
            type: "default",
            title: decodeURIComponent(title),
            subtitle: subtitle ? decodeURIComponent(subtitle) : undefined,
          };
        } else {
          const date = url.searchParams.get("date");
          const tags = url.searchParams.get("tags");
          const description = url.searchParams.get("description");
          if (!title || !date || !tags || !description) return badRequest();
          spec = {
            type: "post",
            title: decodeURIComponent(title),
            date,
            tags: decodeURIComponent(tags)
              .split(",")
              .map((tag) => tag.trim()),
            description: decodeURIComponent(description),
          };
        }

        const png = await renderOgImage(spec, url.origin);
        return new Response(png, { headers: PNG_HEADERS });
      },
    },
  },
});
