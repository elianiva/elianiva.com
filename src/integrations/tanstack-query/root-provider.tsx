import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
      },
    },
  });
}

/**
 * Router context factory. The router owns the single QueryClient and the
 * root route provides that same instance via QueryClientProvider, so the
 * SSR integration dehydrates/hydrates the exact cache the components read.
 * Do not create a second client in a separate provider — that silently
 * disconnects hydration (and the devtools panel) from the router's cache.
 */
export function getContext() {
  return {
    queryClient: createQueryClient(),
  };
}
