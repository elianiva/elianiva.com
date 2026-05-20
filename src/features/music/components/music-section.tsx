import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getMusicTracksRsc } from "../lib/lastfm";
import { MusicPageSkeleton } from "~/components/ui/page-skeleton";

function MusicTrackList() {
  const { data } = useSuspenseQuery({
    queryKey: ["recent-tracks"],
    queryFn: () => getMusicTracksRsc(),
  });
  return <>{data}</>;
}

export function MusicSection() {
  return (
    <Suspense fallback={<MusicPageSkeleton />}>
      <MusicTrackList />
    </Suspense>
  );
}
