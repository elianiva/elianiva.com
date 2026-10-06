import { Skeleton } from "~/components/ui/skeleton";

export function MusicTopListsSkeleton() {
  return (
    <div className="animate-pulse">
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
    </div>
  );
}

export function MusicTracksSkeleton() {
  return (
    <div className="animate-pulse">
      <section className="py-4 md:py-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full aspect-square" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </section>
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
