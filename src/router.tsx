import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { getContext } from "./integrations/tanstack-query/root-provider";

// Start calls this on both sides: the server prerender (no `document`)
// and the client boot. `setupRouterSsrQueryIntegration` serialises the
// query cache into the prerendered HTML so client data (posts, projects)
// hydrates without refetching; browser-only queries (GitHub, Last.fm)
// resolve after hydration through their normal Suspense fallbacks.
//
// `wrapQueryClient: false` because the root route already owns the
// QueryClientProvider (`TanstackQueryProvider`); the integration only
// handles dehydration/hydration here, not provisioning.
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
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
