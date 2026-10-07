import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
// Global styles: Tailwind theme + prose treatment (styles.css) and the
// TanStack Highlight token colors (highlight.css). Imported here so Vite
// bundles them into the client CSS Start injects into every prerendered
// page — there is no `?url` link anymore.
import "../styles.css";
import "../highlight.css";
import { Frame } from "../components/frame";
import { CanvasBackground } from "../components/canvas-background";
import { Footer } from "../components/footer";

import { NavigationStrip } from "~/components/navigation";
import { TooltipProvider } from "~/components/ui/tooltip";

function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-container items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-pink-400">
          404 / lost in the blush
        </p>
        <h1 className="mt-3 text-3xl font-display text-pink-800 md:text-5xl">
          This page drifted off somewhere.
        </h1>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-pink-950/75 md:text-base">
          The URL you opened does not exist here anymore.
        </p>
      </div>
    </div>
  );
}

const Devtools = lazy(async () => {
  const [{ TanStackDevtools }, { TanStackRouterDevtoolsPanel }, mod] = await Promise.all([
    import("@tanstack/react-devtools"),
    import("@tanstack/react-router-devtools"),
    import("../integrations/tanstack-query/devtools"),
  ]);
  return {
    default: () => (
      <TanStackDevtools
        config={{ position: "bottom-right" }}
        plugins={[
          { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
          mod.default,
        ]}
      />
    ),
  };
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  notFoundComponent: NotFoundPage,
  component: RootLayout,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#fff5f0" },
    ],
    links: [
      { rel: "icon", href: "/favicon.png", type: "image/png", sizes: "32x32" },
      { rel: "alternate", href: "/rss.xml", type: "application/rss+xml", title: "elianiva" },
      { rel: "preconnect", href: "https://avatars.githubusercontent.com" },
    ],
  }),
});

function RootLayout() {
  const { queryClient } = Route.useRouteContext();
  return (
    <html lang="en" className="h-full">
      <head>
        <HeadContent />
      </head>
      <body className="h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pink-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring focus:ring-pink-800"
        >
          Skip to main content
        </a>

        <CanvasBackground />
        <Frame />
        <NavigationStrip />

        {/* Single shared client from the router context: the SSR
            integration hydrates this exact cache — a separately created
            client here would read empty while hydration lands elsewhere.
            Everything that touches queries (page content and the query
            devtools panel) lives inside this provider so `useQueryClient`
            never resolves to null. */}
        <QueryClientProvider client={queryClient}>
          <main id="main-content" role="main" className="relative z-0 flex-1 p-2 md:p-0">
            <TooltipProvider>
              <Outlet />
            </TooltipProvider>
          </main>

          <Footer />

          {import.meta.env.DEV ? (
            <Suspense fallback={null}>
              <Devtools />
            </Suspense>
          ) : null}
        </QueryClientProvider>

        <Scripts />
      </body>
    </html>
  );
}
