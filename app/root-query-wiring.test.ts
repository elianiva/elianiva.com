import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vite-plus/test";

describe("query wiring", () => {
  it("the home heatmap is prerendered; music, last plays and live GitHub rows are browser-only", async () => {
    const read = (f: string) => readFile(f, "utf8");
    // The heatmap's Layer is built on the server, so crawlers read it.
    expect(await read("app/pages/Home.ts")).not.toContain("server: false");
    // Everything secret-backed or live stays off the prerender, as before.
    for (const f of ["app/ui/music-body.ts", "app/ui/based-row.ts", "app/ui/listening-cell.ts"]) {
      expect(await read(f), `${f} must opt out of the server render`).toContain("server: false");
    }
  });

  it("the site Worker forwards /api/* to the Api Worker, which holds the secrets", async () => {
    const runSource = await readFile("alchemy.run.ts", "utf8");
    expect(runSource).toMatch(/runWorkerFirst:\s*\[\s*"\/api\/\*"\s*\]/);
    expect(runSource).toMatch(/env:\s*\{\s*API:/);
    const worker = await readFile("worker/worker.ts", "utf8");
    expect(worker).toContain('Config.Redacted("GH_TOKEN")');
    expect(worker).toContain('Config.Redacted("LASTFM_API_KEY")');
  });
});
