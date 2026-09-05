import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { ImageResponse } from "takumi-js/response";
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  OgImage,
  ogFonts,
  type OgImageSpec,
} from "~/features/og-image/lib/og-image";
import { ogWasmModule } from "~/features/og-image/lib/og-wasm.server";

function badRequest() {
  return new Response("Missing required query parameters", { status: 400 });
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

        let spec: OgImageSpec;
        if (type === "default") {
          if (!title) return badRequest();
          const subtitle = url.searchParams.get("subtitle");
          spec = { type: "default", title, subtitle: subtitle ?? undefined };
        } else {
          const date = url.searchParams.get("date");
          const tags = url.searchParams.get("tags");
          const description = url.searchParams.get("description");
          if (!title || !date || !tags || !description) return badRequest();
          spec = {
            type: "post",
            title,
            date,
            tags: tags.split(",").map((tag) => tag.trim()),
            description,
          };
        }

        // URLSearchParams already decodes values — no extra decodeURIComponent
        // (it throws on stray "%" and double-decodes "+" into spaces).
        // Buffer the render before responding: if Takumi fails we return a
        // loud 500 with the message instead of a truncated empty 200 stream.
        const response = new ImageResponse(<OgImage spec={spec} />, {
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          // Precompiled WASM module: forces the WASM backend and skips the
          // native-addon auto-detection (native can't load in workerd).
          // Must be a static import — Workers ban runtime instantiate(bytes).
          module: ogWasmModule,
          fonts: ogFonts(url.origin),
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
