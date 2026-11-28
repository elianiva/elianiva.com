import { Effect } from "effect";
import { HttpRouter } from "effect/http";
import { apiRoutes } from "./app";

/**
 * The API routes run in this process, with the tokens from `process.env` and no
 * cache. The prerender uses it to bake GitHub data into the home page, and
 * `vite dev` uses it behind `/api/*`, because neither has an Api Worker.
 */
const { handler } = HttpRouter.toWebHandler(
  apiRoutes(
    Effect.sync(() => ({
      githubToken: process.env.GH_TOKEN ?? "",
      lastfmKey: process.env.LASTFM_API_KEY ?? "",
    })),
  ),
);

export const localApi = (request: Request): Promise<Response> => handler(request);
