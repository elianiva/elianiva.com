/**
 * Reads one of the site's JSON routes. The browser asks the Api Worker. The
 * server, which is the build's prerender, runs the same routes in-process.
 */
export async function getApi<T>(path: `/api/${string}`): Promise<T> {
  const response = import.meta.env.SSR
    ? await (await import("~/api/local")).localApi(new Request(`http://localhost${path}`))
    : await fetch(path);
  if (!response.ok) throw new Error(`${path} answered ${response.status}`);
  return (await response.json()) as T;
}
