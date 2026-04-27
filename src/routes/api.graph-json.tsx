import { createFileRoute } from "@tanstack/react-router";
import { buildGraph } from "#/lib/notes";

export const Route = createFileRoute("/api/graph-json")({
  server: {
    handlers: {
      GET: async () => {
        const graph = await buildGraph();
        return Response.json(graph, {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
