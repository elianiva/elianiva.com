/**
 * The site Worker's only code. `/api/*` goes to the Api Worker through the
 * `API` service binding; everything else is a prerendered static asset.
 */
type Fetcher = { fetch: (request: Request) => Promise<Response> };

export default {
  fetch(request: Request, env: { API: Fetcher; ASSETS: Fetcher }): Promise<Response> {
    return new URL(request.url).pathname.startsWith("/api/")
      ? env.API.fetch(request)
      : env.ASSETS.fetch(request);
  },
};
