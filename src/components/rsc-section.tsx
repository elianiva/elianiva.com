import { Suspense, type ReactNode } from "react";
import { useSuspenseQuery, type QueryKey } from "@tanstack/react-query";

export function RscSection({
  queryKey,
  queryFn,
  fallback,
  staleTime,
}: {
  queryKey: QueryKey;
  queryFn: () => Promise<ReactNode>;
  fallback: ReactNode;
  staleTime?: number;
}) {
  return (
    <Suspense fallback={fallback}>
      <RscData queryKey={queryKey} queryFn={queryFn} staleTime={staleTime} />
    </Suspense>
  );
}

function RscData({
  queryKey,
  queryFn,
  staleTime,
}: {
  queryKey: QueryKey;
  queryFn: () => Promise<ReactNode>;
  staleTime?: number;
}) {
  const { data } = useSuspenseQuery({ queryKey, queryFn, staleTime });
  return <>{data}</>;
}
