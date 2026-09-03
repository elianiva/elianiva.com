import { createFileRoute } from "@tanstack/react-router";
import {
  ogImageSpecSchema,
  renderOgImage,
  type OgImageSpec,
} from "~/features/og-image/lib/og-image";

const PNG_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800, immutable",
  "CDN-Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
};

function badRequest(message = "Missing required query parameters") {
  return new Response(message, { status: 400 });
}

export const Route = createFileRoute("/api/og-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const type = url.searchParams.get("type") || "post";
        const title = url.searchParams.get("title");

        let raw: unknown;
        if (type === "default") {
          if (!title) return badRequest("type=default requires title");
          const subtitle = url.searchParams.get("subtitle");
          raw = {
            type: "default" as const,
            title: decodeURIComponent(title),
            subtitle: subtitle ? decodeURIComponent(subtitle) : undefined,
          };
        } else {
          const date = url.searchParams.get("date");
          const tags = url.searchParams.get("tags");
          const description = url.searchParams.get("description");
          if (!title || !date || !tags || !description)
            return badRequest("type=post requires title, date, tags, description");
          raw = {
            type: "post" as const,
            title: decodeURIComponent(title),
            date,
            tags: decodeURIComponent(tags)
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            description: decodeURIComponent(description),
          };
        }

        const parsed = ogImageSpecSchema.safeParse(raw);
        if (!parsed.success)
          return badRequest(parsed.error.issues[0]?.message ?? "Invalid parameters");
        const spec: OgImageSpec = parsed.data;

        try {
          const png = await renderOgImage(spec, url.origin);
          return new Response(png, { headers: PNG_HEADERS });
        } catch {
          return new Response("Failed to render image", { status: 500 });
        }
      },
    },
  },
});
