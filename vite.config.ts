import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import contentCollections from "@content-collections/vite"
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import glsl from 'vite-plugin-glsl'
import Icons from 'unplugin-icons/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    contentCollections(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        failOnError: true,
        filter: ({ path }) => {
          // Skip dynamic routes that don't exist yet or aren't static
          if (path.startsWith('/notes')) return false
          if (path.startsWith('/assets/')) return false
          return true
        },
      },
    }),
    viteReact(),
    glsl(),
    Icons({ compiler: 'jsx', jsx: 'react' }),
  ],
})

export default config
