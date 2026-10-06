import { defineConfig, lazyPlugins } from "vite-plus";
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

const config = defineConfig({
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
      spa: {
        enabled: true,
        prerender: {
          crawlLinks: true,
        },
      },
      sitemap: {
        host: "https://elianiva.com",
      },
      prerender: {
        crawlLinks: true,
        failOnError: false,
      },
    }),
    viteReact({ include: /\.(jsx|js|tsx|ts)$/ }),
    Icons({ compiler: "jsx", jsx: "react" }),
  ]),
});

export default config;
