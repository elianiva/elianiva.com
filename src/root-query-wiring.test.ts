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

  it("token-gated routes never bake empty fallbacks into the prerender", async () => {
    const music = await readFile("src/routes/music.tsx", "utf8");
    expect(music, "src/routes/music.tsx must opt out of SSR").toMatch(/ssr:\s*false/);

    // The home page prerenders and bakes its GitHub data in at build time, so
    // it must load it in the route loader and never fetch in the browser.
    const home = await readFile("src/routes/index.tsx", "utf8");
    expect(home).not.toMatch(/ssr:\s*false/);
    expect(home).not.toContain("ClientOnly");
    // A missing token falls back to an empty heatmap rather than failing the build.
    expect(home).toMatch(/loader:\s*async\s*\(\)\s*=>\s*\(await getGitHubContributions\(\)\)/);
  });

  it("worker exposes env through process.env for server functions", async () => {
    const runSource = await readFile("alchemy.run.ts", "utf8");
    expect(runSource).toContain("nodejs_compat_populate_process_env");
  });
});
