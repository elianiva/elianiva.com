import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import contentCollections from "@content-collections/vite";
import viteReact from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import glsl from "vite-plugin-glsl";
import Icons from "unplugin-icons/vite";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypePrettyCode from "rehype-pretty-code";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: "rose-pine-dawn",
  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className ??= [];
    node.properties.className.push("line--highlighted");
  },
  onVisitHighlightedChars(node) {
    node.properties.className ??= [];
    node.properties.className.push("word--highlighted");
  },
};

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
      }),
    },
    devtools(),
    contentCollections({ environment: "ssr", configPath: "content-collections.config.ts" }),
    rsc(),
    cloudflare({
      viteEnvironment: {
        name: "ssr",
        childEnvironments: ["rsc"],
      },
    }),
    tailwindcss(),
    tanstackStart({
      rsc: {
        enabled: true,
      },
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        failOnError: true,
        filter: ({ path }) => {
          // Skip dynamic routes that don't exist yet or aren't static
          if (path.startsWith("/notes")) return false;
          if (path.startsWith("/assets/")) return false;
          return true;
        },
      },
    }),
    viteReact({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    glsl(),
    Icons({ compiler: "jsx", jsx: "react" }),
  ],
});

export default config;
