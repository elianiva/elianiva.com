import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";

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

export function getContext() {
  return {
    queryClient: createQueryClient(),
  };
}

export default function TanstackQueryProvider({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient?: QueryClient;
}) {
  let client = queryClient;
  if (!client) {
    try {
      const router = useRouter() as unknown as {
        options: { context?: { queryClient?: QueryClient } };
      };
      client = router.options.context?.queryClient;
    } catch {
      client = undefined;
    }
  }
  const resolved = client ?? createQueryClient();
  return <QueryClientProvider client={resolved}>{children}</QueryClientProvider>;
}
