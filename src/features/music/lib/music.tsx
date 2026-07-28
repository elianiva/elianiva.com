import { Effect } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { runtime } from "~/lib/effect";
import { LastFM } from "./lastfm.service";
import { MusicPage } from "~/features/music/components/music-page";

export const getMusicTracksRsc = createServerFn({ method: "GET" }).handler(async () => {
  const music = await runtime.runPromise(
    Effect.gen(function* () {
      const svc = yield* LastFM;
      return yield* svc.getAllMusicData();
    }),
  );
  return renderServerComponent(<MusicPage music={music} />);
});
