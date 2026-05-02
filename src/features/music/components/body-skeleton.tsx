function TrackCardSkel() {
  return (
    <div className="flex flex-col border border-pink-200/50 bg-white/40 overflow-hidden">
      <div className="w-full aspect-square bg-pink-100/30 animate-pulse" />
      <div className="p-1.5 min-w-0 space-y-1">
        <div className="h-3 w-4/5 bg-pink-100/50 animate-pulse rounded" />
        <div className="h-2.5 w-3/5 bg-pink-100/30 animate-pulse rounded" />
        <div className="flex justify-between mt-1">
          <div className="h-2 w-1/3 bg-pink-100/30 animate-pulse rounded" />
          <div className="h-2 w-6 bg-pink-100/30 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

function NowPlayingPanelSkel() {
  return (
    <section className="my-6 border border-pink-300/50 bg-pink-50/30">
      <div className="flex items-center">
        <div className="min-w-0 space-y-2 flex-1 pl-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="size-2 rounded-full bg-pink-300 animate-pulse" />
            <div className="h-3 w-20 bg-pink-100/50 animate-pulse rounded" />
          </div>
          <div className="h-6 w-3/4 bg-pink-100/50 animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-pink-100/30 animate-pulse rounded" />
          <div className="h-3 w-1/3 bg-pink-100/20 animate-pulse rounded" />
        </div>
        <div className="size-40 bg-pink-100/30 animate-pulse shrink-0" />
      </div>
    </section>
  );
}

export function BodySkel() {
  return (
    <>
      <NowPlayingPanelSkel />
      <section className="mt-6 border-t border-pink-200/50">
        <div className="py-4 font-mono text-xs text-pink-950/30 tracking-widest uppercase">
          history
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <TrackCardSkel key={i} />
          ))}
        </div>
      </section>
    </>
  );
}
