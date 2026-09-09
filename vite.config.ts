import { defineConfig, lazyPlugins } from "vite-plus";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import contentCollections from "@content-collections/vite";
import viteReact from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypePrettyCode from "rehype-pretty-code";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";

const compiledWasmRef = (filePath: string) => `__COMPILED_WASM__${filePath}__COMPILED_WASM__`;
const compiledWasmRefRe = /__COMPILED_WASM__(.*?)__COMPILED_WASM__/g;

function compiledWasmPlugin() {
  return {
    name: "compiled-wasm",
    enforce: "pre" as const,
    async resolveId(
      this: {
        resolve: (
          id: string,
          importer: string | undefined,
          options: { skipSelf: boolean },
        ) => Promise<{ id: string } | null>;
      },
      source: string,
      importer: string | undefined,
    ) {
      if (!source.endsWith(".wasm?module")) return;
      const resolved = await this.resolve(source.replace(/\?module$/, ""), importer, {
        skipSelf: true,
      });
      if (!resolved) return;
      return { id: compiledWasmRef(resolved.id), external: true };
    },
    async renderChunk(
      this: {
        emitFile: (file: {
          type: "asset";
          name: string;
          originalFileName: string;
          source: Buffer;
        }) => string;
        getFileName: (id: string) => string;
      },
      code: string,
      chunk: { fileName: string },
    ) {
      const matches = [...code.matchAll(compiledWasmRefRe)];
      if (matches.length === 0) return;
      let next = code;
      for (const match of matches) {
        const filePath = match[1];
        if (!filePath) continue;
        const source = await readFile(filePath);
        const referenceId = this.emitFile({
          type: "asset",
          name: path.basename(filePath),
          originalFileName: filePath,
          source,
        });
        const emittedFileName = this.getFileName(referenceId);
        const relativePath = path.posix.relative(
          path.posix.dirname(chunk.fileName),
          emittedFileName,
        );
        const importPath = relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
        next = next.replaceAll(match[0], importPath);
      }
      return { code: next };
    },
  };
}

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
  build: {
    rolldownOptions: {
      external: ["cloudflare:workers"],
    },
  },
  plugins: lazyPlugins(() => [
    ...(process.env.ALCHEMY_CLOUDFLARE_VITE_INJECTED === "1" ? [] : [compiledWasmPlugin()]),
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
      }),
    },
    ...(process.env.NODE_ENV !== "production" ? [devtools()] : []),
    contentCollections({ configPath: "content-collections.config.ts" }),
    rsc(),
    tailwindcss(),
    tanstackStart({
      rsc: {
        enabled: true,
      },
      prerender: {
        enabled: false,
      },
    }),
    viteReact({ include: /\.(jsx|js|tsx|ts)$/ }),
    Icons({ compiler: "jsx", jsx: "react" }),
  ]),
});

export default config;
