import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

const MIME: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  heic: "image/heic",
  avif: "image/avif",
};

function mimeFromKey(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  return MIME[ext] ?? "image/webp";
}

export const Route = createFileRoute("/api/photography/image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const path = u.searchParams.get("path");
        const type = u.searchParams.get("type") ?? "smol";
        if (!path) {
          return new Response("Missing path param", { status: 400 });
        }

        // Prevent path traversal
        const sanitised = path.replace(/\.\.\//g, "").replace(/^\/+/, "");

        // Original strips ".smol" from filename
        const key =
          type === "original"
            ? `photography/${sanitised.replace(".smol.", ".")}`
            : `photography/${sanitised}`;

        const obj = await env.PHOTOS.get(key);
        if (!obj) {
          return new Response("Not found", { status: 404 });
        }

        const blob = await obj.blob();
        return new Response(blob, {
          headers: {
            "Content-Type": mimeFromKey(key),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
