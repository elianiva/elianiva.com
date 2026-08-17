import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useLocation,
} from "@tanstack/react-router";
import { PropsWithChildren, useEffect } from "react";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import TanstackQueryProvider from "../integrations/tanstack-query/root-provider";
import { Frame } from "../components/frame";
import { CanvasBackground } from "../components/canvas-background";
import { Footer } from "../components/footer";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { NavigationStrip } from "~/components/navigation";
import { TooltipProvider } from "~/components/ui/tooltip";

interface MyRouterContext {
  queryClient: QueryClient;
}

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

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#fff5f0" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png", sizes: "32x32" },
      { rel: "alternate", href: "/rss.xml", type: "application/rss+xml", title: "elianiva" },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RootDocument(props: PropsWithChildren<{}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <HeadContent />
      </head>
      <body className="h-full flex flex-col">
        <ScrollToTop />
        {/* Skip Navigation Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pink-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring focus:ring-pink-800"
        >
          Skip to main content
        </a>

        <CanvasBackground />
        <Frame />
        <NavigationStrip />

        <main id="main-content" role="main" className="relative z-0 flex-1 p-2 md:p-0">
          <TooltipProvider>
            <TanstackQueryProvider>{props.children}</TanstackQueryProvider>
          </TooltipProvider>
        </main>

        <Footer />

        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
