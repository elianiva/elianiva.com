import { Effect } from "effect";
import { runtime } from "~/lib/effect";
import { LastFM } from "./lastfm.service";

/**
 * Client-side Last.fm reads. Same query shapes as before, executed from the
 * browser through the client Effect runtime (`~/lib/effect`). Without
 * `VITE_LASTFM_API_KEY` the service degrades to empty data — the sections
 * render their empty states instead of failing.
 */
export function getTopListsData() {
  return runtime.runPromise(
    Effect.gen(function* () {
      const svc = yield* LastFM;
      return yield* svc.getTopListsData();
    }),
  );
}

export function getRecentTracks() {
  return runtime.runPromise(
    Effect.gen(function* () {
      const svc = yield* LastFM;
      return yield* svc.getRecentTracks();
    }),
  );
}
