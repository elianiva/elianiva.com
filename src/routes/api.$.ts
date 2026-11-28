import { createFileRoute } from "@tanstack/react-router";

/**
 * `/api/*` belongs to the Api Worker. On Cloudflare this forwards to it through
 * the `API` service binding. Plain `vite dev` runs on Node, where there is no
 * binding, so the same routes run in-process with the tokens from `process.env`
 * and no cache.
 */
async function forward(request: Request): Promise<Response> {
  try {
    const { env } = await import("cloudflare:workers");
    const api = (env as { API?: { fetch: (request: Request) => Promise<Response> } }).API;
    if (api) return api.fetch(request);
  } catch {
    // Not on Workers.
  }
  return (await import("~/api/local")).localApi(request);
}

export const Route = createFileRoute("/api/$")({
  server: { handlers: { GET: ({ request }) => forward(request) } },
});
