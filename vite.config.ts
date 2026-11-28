import { defineConfig, type Plugin } from "vite-plus";
import { execSync } from "node:child_process";
import path from "node:path";
import pandacss from "@pandacss/vite";
import { plugin as htmlServer } from "@effect/ui/html/HtmlServerVite";
import { DevToolsVite } from "@effect/ui-devtools/node";
import { content } from "./app/plugins/content";
import { hoistCss } from "./panda/hoist-css";

/**
 * The site's latest commits and its commit count, read once when Vite starts
 * and baked into the footer. A checkout without history gets an empty receipt;
 * the deploy workflow fetches the full history for this.
 */
function siteHistory() {
  try {
    const git = (args: string) => execSync(`git ${args}`, { encoding: "utf8" }).trim();
    const commits = git("log -6 --no-merges --format=%h%x1f%cI%x1f%s")
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash = "", date = "", subject = ""] = line.split("\x1f");
        return { hash, date, subject };
      });
    return { total: Number(git("rev-list --count HEAD")), commits };
  } catch {
    return { total: 0, commits: [] };
  }
}

/**
 * `robots.txt`, `llms.txt`, `rss.xml`, `sitemap.xml`, and the OG cards are
 * plain files, not routes, so the prerender never emits them. They are built
 * from inside the Vite build because `alchemy deploy` runs its own `vite build`
 * child process, so a step after `vp build` never runs on a real deploy.
 *
 * `buildApp` with `order: "post"` runs after the Effect UI plugin's own
 * `buildApp` has built both environments and written the prerendered pages, so
 * the files land in the client `outDir` next to them.
 */
function emitStaticAssets(): Plugin {
  let emitted = false;
  return {
    name: "emit-static-assets",
    apply: "build",
    buildApp: {
      order: "post",
      async handler(builder) {
        // The hook can be reached once per builder; the files are shared, so emit once.
        if (emitted) return;
        emitted = true;
        const client = builder.environments.client;
        const outDir = path.resolve(client.config.root, client.config.build.outDir);
        const { emitStaticAssets: emit } = await import("./scripts/static-assets");
        await emit(client.config.root, outDir);
      },
    },
  };
}

const config = defineConfig({
  define: {
    __SITE_HISTORY__: JSON.stringify(siteHistory()),
  },
  staged: { "*": "vp check --fix" },
  fmt: { ignorePatterns: ["styled-system"] },
  lint: {
    ignorePatterns: ["styled-system", "src"],
    plugins: ["typescript", "unicorn", "oxc"],
    categories: { correctness: "error" },
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    env: { builtin: true },
    options: { typeAware: true, typeCheck: true },
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
  },
  resolve: { tsconfigPaths: true },
  server: { port: 3000, strictPort: true },
  plugins: [
    pandacss(),
    content(),
    hoistCss(),
    htmlServer({ entry: "/app/entry.server.ts" }),
    ...(process.env.NODE_ENV !== "production" ? [DevToolsVite.plugin()] : []),
    emitStaticAssets(),
  ],
});

export default config;
