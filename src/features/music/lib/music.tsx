import { Effect } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { runtime } from "~/lib/effect";
import { LastFM } from "./lastfm.service";
import { MusicTopListsSection } from "~/features/music/components/music-top-lists-section";
import { MusicTracksSection } from "~/features/music/components/music-tracks-section";

export const getTopListsRsc = createServerFn({ method: "GET" }).handler(async () => {
  const data = await runtime.runPromise(
    Effect.gen(function* () {
      const svc = yield* LastFM;
      return yield* svc.getTopListsData();
    }),
  );
  return renderServerComponent(<MusicTopListsSection data={data} />);
});

export const getRecentTracksRsc = createServerFn({ method: "GET" }).handler(async () => {
  const data = await runtime.runPromise(
    Effect.gen(function* () {
      const svc = yield* LastFM;
      return yield* svc.getRecentTracks();
    }),
  );
  return renderServerComponent(<MusicTracksSection data={data} />);
});
