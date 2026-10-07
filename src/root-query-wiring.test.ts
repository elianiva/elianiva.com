import { describe, expect, it } from "vite-plus/test";
import { readFile } from "node:fs/promises";

/**
 * The root route must serve the router-owned QueryClient, not mint its own.
 * Two clients silently disconnect the SSR dehydration/hydration integration
 * (and the devtools panel) from the cache the page components actually read —
 * which surfaces as `No QueryClient set` and stale sections.
 */
describe("root query wiring", () => {
  it("root route provides the router-context client", async () => {
    const rootSource = await readFile("src/routes/__root.tsx", "utf8");
    expect(rootSource).toContain("createRootRouteWithContext<{ queryClient: QueryClient }>");
    expect(rootSource).toContain("Route.useRouteContext()");
    expect(rootSource).toContain("<QueryClientProvider client={queryClient}>");
    expect(rootSource).not.toContain("TanstackQueryProvider");
  });

  it("no second client is created in a separate provider", async () => {
    const providerSource = await readFile(
      "src/integrations/tanstack-query/root-provider.tsx",
      "utf8",
    );
    expect(providerSource).toContain("export function getContext()");
    // The factory file may mention QueryClientProvider in comments explaining
    // why it must NOT create one — only forbid an actual separate provider.
    expect(providerSource).not.toMatch(/<QueryClientProvider/);
  });

  it("secret-backed queries skip prerender dehydration", async () => {
    const routerSource = await readFile("src/router.tsx", "utf8");
    for (const key of ["github-prs", "github-contributions", "music"]) {
      expect(routerSource, `missing exclusion for ${key}`).toContain(key);
    }
    expect(routerSource).toContain("shouldDehydrateQuery");
  });

  it("token-gated routes skip SSR so builds never bake empty fallbacks", async () => {
    for (const path of ["src/routes/index.tsx", "src/routes/music.tsx"]) {
      const source = await readFile(path, "utf8");
      expect(source, `${path} must opt out of SSR`).toMatch(/ssr:\s*false/);
    }
  });

  it("worker exposes env through process.env for server functions", async () => {
    const runSource = await readFile("alchemy.run.ts", "utf8");
    expect(runSource).toContain("nodejs_compat_populate_process_env");
  });
});
