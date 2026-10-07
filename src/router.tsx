import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { getContext } from "./integrations/tanstack-query/root-provider";

// Start calls this on both sides: the server prerender (no `document`)
// and the client boot. `setupRouterSsrQueryIntegration` serialises the
// query cache into the prerendered HTML so client data (posts, projects)
// hydrates without refetching.
//
// `dehydrateOptions.shouldDehydrateQuery` keeps the secret-backed queries
// (GitHub, Last.fm) out of the prerendered shell. At build time their
// server functions have no token and answer with empty fallbacks; baking
// that emptiness into the HTML would ship stale sections that never refetch
// (their `staleTime` is in hours), so they resolve in the browser after
// hydration through their normal Suspense fallbacks instead.
//
// `wrapQueryClient: false` because the root route already provides the
// router's QueryClient from context (`createRootRouteWithContext` +
// `QueryClientProvider`); the integration only handles
// dehydration/hydration here, not provisioning.
export function getRouter() {
  const context = getContext();

  const router = createRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultViewTransition: true,
    defaultPendingMs: 0,
    defaultPendingMinMs: 0,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient: context.queryClient,
    wrapQueryClient: false,
    // Static content hydrates; secret-backed queries refetch in the browser.
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        const key = query.queryKey[0];
        return key !== "github-prs" && key !== "github-contributions" && key !== "music";
      },
    },
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
