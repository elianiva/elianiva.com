import { Skeleton } from "~/components/ui/skeleton";

export function AiPageSkeleton() {
  return (
    <div className="mx-auto max-w-container pt-10 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8 animate-pulse">
        <div className="pb-8 with-box-underline relative">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-96 mt-4" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-2 mb-8">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-2 mb-8">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

export function MusicPageSkeleton() {
  return (
    <div className="mx-auto max-w-container pt-10 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8 animate-pulse">
        <div className="pb-4 md:pb-8 with-box-underline relative">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-96 mt-4" />
          <div className="flex gap-4 mt-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 py-4 md:py-8 relative with-box-underline">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-10 w-24" />
            </div>
          ))}
        </div>
        <section className="py-4 md:py-8 relative with-box-underline">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </section>
        <section className="py-4 md:py-8">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-0">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-3 border-b border-pink-100/50">
                <Skeleton className="size-12 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="hidden md:flex flex-col items-end gap-1 py-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[64ch] px-4 lg:px-0 py-10 animate-pulse">
      <Skeleton className="h-4 w-20 mb-8" />
      <div className="pt-6">
        <Skeleton className="h-9 w-72 mb-4" />
        <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-40 mb-2" />
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-16" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className={i % 5 === 0 ? "h-6 w-48" : i % 5 === 4 ? "h-4 w-3/4" : "h-4 w-full"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div className="mx-auto max-w-container px-2 md:px-4 py-10 border-x border-pink-200/50 animate-pulse">
      <Skeleton className="h-4 w-20 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-[2.5fr_1fr] gap-4 pt-6">
        <div className="space-y-4">
          <Skeleton className="h-80 w-full" />
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className={i % 4 === 3 ? "h-4 w-3/4" : "h-4 w-full"} />
            ))}
          </div>
        </div>
        <aside className="h-fit">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-12 shrink-0" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
