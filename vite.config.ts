import { defineConfig, lazyPlugins, type Plugin } from "vite-plus";
import { execFileSync, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { devtools } from "@tanstack/devtools-vite";
import contentCollections from "@content-collections/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { rehypeHighlightCodeBlocks } from "@tanstack/highlight/rehype";
import { highlighter } from "./src/lib/highlight";

/**
 * Links to files in `public/` (the CV PDF) get crawled like pages, and the
 * prerenderer rewrites them as UTF-8 text, corrupting the binary and leaving
 * a blank PDF. Only extension-less paths are real routes.
 */
const isPrerenderablePage = ({ path }: { path: string }) => !/\.[a-z0-9]+$/i.test(path);

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
 * `robots.txt`, `llms.txt`, `rss.xml`, and the OG cards are plain files, not
 * routes, so Start never emits them. They are built from inside the Vite build
 * rather than from a script after `vp build`: `alchemy deploy` runs its own
 * `vite build` child process, so a post-build step never runs on a real deploy
 * and every one of these files fell through to the SPA shell (the feed served
 * HTML). The builder runs under `tsx` because the OG cards render the real
 * `.tsx` components.
 */
function emitStaticAssets(): Plugin {
  let emitted = false;
  return {
    name: "emit-static-assets",
    apply: "build",
    closeBundle() {
      // Vite closes the client and server builds separately; the files are
      // shared, so emit once.
      if (emitted) return;
      emitted = true;
      execFileSync("node_modules/.bin/tsx", ["scripts/build-static-assets.ts"], {
        stdio: "inherit",
      });
    },
  };
}

const config = defineConfig({
  define: {
    __SITE_HISTORY__: JSON.stringify(siteHistory()),
  },
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns: ["src/routeTree.gen.ts"],
  },
  lint: {
    ignorePatterns: ["src/routeTree.gen.ts"],
    plugins: ["typescript", "unicorn", "oxc"],
    categories: {
      correctness: "error",
    },
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    env: {
      builtin: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  plugins: lazyPlugins(() => [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        rehypePlugins: [[rehypeHighlightCodeBlocks, { highlighter }]],
      }),
    },
    ...(process.env.NODE_ENV !== "production" ? [devtools()] : []),
    contentCollections({ configPath: "content-collections.config.ts" }),
    tailwindcss(),
    tanstackStart({
      // Fully static output: every route (dynamic slugs included) is
      // prerendered to HTML at build time via link crawling, and the
      // `_shell.html` fallback boots the client router for anything else.
      // There is no SSR at request time and no server bundle to deploy —
      // alchemy serves `dist/client` as plain static assets.
      router: {
        // Colocated `*.test.*` files are not routes. Exclude them from
        // route discovery (silences the generator warning) while keeping
        // the conventional suffix vitest discovers.
        routeFileIgnorePattern: "\\.(test|spec)\\.(ts|tsx|js|jsx)$",
      },
      pages: [{ path: "/" }],
      spa: {
        // Dev renders each request on the server, like the prerendered
        // build, instead of sending an empty shell.
        enabled: process.env.NODE_ENV === "production",
        // The shell defaults to masking `/`, which leaves the home page as an
        // empty `_shell.html` for crawlers and agents that never run JS. Mask
        // a path nothing links to so `/` prerenders as a real page.
        maskPath: "/posts/__shell",
        prerender: {
          crawlLinks: true,
        },
      },
      sitemap: {
        host: "https://elianiva.com",
      },
      prerender: {
        crawlLinks: true,
        filter: isPrerenderablePage,
        failOnError: false,
      },
    }),
    emitStaticAssets(),
    viteReact({ include: /\.(jsx|js|tsx|ts)$/ }),
    Icons({ compiler: "jsx", jsx: "react" }),
  ]),
});

export default config;
