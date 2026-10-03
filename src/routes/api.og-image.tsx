import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { ImageResponse } from "takumi-js/response";
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  OgImage,
  ogFonts,
  ogImageSpecSchema,
  type OgImageSpec,
} from "~/features/og-image/lib/og-image";
import { ogCompiledWasm } from "~/features/og-image/lib/og-wasm.server";

function badRequest(message = "Missing required query parameters") {
  return new Response(message, { status: 400 });
}

function logRenderError(error: unknown) {
  Effect.runSync(Effect.sync(() => console.error("OG render failed:", error)));
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
          raw = { type: "default" as const, title, subtitle: subtitle ?? undefined };
        } else {
          const date = url.searchParams.get("date");
          // A post with no tags or no description still deserves a card, so
          // both are optional rather than a 400.
          if (!title || !date) return badRequest("type=post requires title, date");
          raw = {
            type: "post" as const,
            title,
            date,
            tags: (url.searchParams.get("tags") ?? "")
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            description: url.searchParams.get("description") ?? "",
          };
        }

        const parsed = ogImageSpecSchema.safeParse(raw);
        if (!parsed.success)
          return badRequest(parsed.error.issues[0]?.message ?? "Invalid parameters");
        const spec: OgImageSpec = parsed.data;

        // URLSearchParams already decodes values — no extra decodeURIComponent
        // (it throws on stray "%" and double-decodes "+" into spaces).
        // Buffer the render before responding: if Takumi fails we return a
        // loud 500 with the message instead of a truncated empty 200 stream.
        const response = new ImageResponse(<OgImage spec={spec} />, {
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          module: ogCompiledWasm,
          fonts: ogFonts(),
          headers: {
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800, immutable",
            "CDN-Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
          onError: logRenderError,
        });
        try {
          await response.ready;
          return response;
        } catch (error) {
          logRenderError(error);
          return new Response(
            `OG render failed: ${error instanceof Error ? error.message : String(error)}`,
            {
              status: 500,
            },
          );
        }
      },
    },
  },
});
