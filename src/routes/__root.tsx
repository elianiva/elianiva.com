import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { SEO } from '../components/SEO'
import { Frame } from '../components/Frame'
import { CanvasBackground } from '../components/CanvasBackground'
import { Footer } from '../components/Footer'

import '@fontsource/chonburi'
import '@fontsource/varela-round'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/400-italic.css'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1080px] items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl border border-pink-200 bg-white/80 p-6 shadow-soft backdrop-blur-sm md:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-pink-400">404 / lost in the blush</p>
        <h1 className="mt-3 text-3xl font-display text-pink-800 md:text-5xl">This page drifted off somewhere dreamy.</h1>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-pink-950/75 md:text-base">
          The URL you opened does not exist here anymore. Try one of these instead.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/" className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100">Home</Link>
          <Link to="/posts" className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100">Posts</Link>
          <Link to="/projects" className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100">Projects</Link>
          <Link to="/notes" className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100">Notes</Link>
        </div>
      </div>
    </div>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <SEO />
        <HeadContent />
        {import.meta.env.PROD && (
          <script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id="09fb4ce5-10bb-467c-9aee-2c95241715dc"
          />
        )}
      </head>
      <body className="h-full">
        {/* Skip Navigation Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pink-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring focus:ring-pink-800"
        >
          Skip to main content
        </a>

        <CanvasBackground />
        <Frame />

        <main id="main-content" role="main" className="relative z-0">
          {children}
        </main>

        <Footer />

        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
