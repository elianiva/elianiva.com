import { readdirSync } from "node:fs";
import { join } from "node:path";
import { document } from "virtual:@effect/ui/document";
import { Layer } from "effect";
import { serverLayer } from "./queries/server";
import { layerHttp } from "./island/server";

export default layerHttp({ budget: "300 millis", document }).pipe(Layer.provide(serverLayer));

/** Pages with a fixed URL. `scripts/static-assets.ts` reads this list for the sitemap. */
export const pages = ["/", "/posts", "/work", "/uses", "/neighbours", "/music", "/projects"];

const slugs = (kind: "posts" | "projects") =>
  readdirSync(join(process.cwd(), "app/content", kind))
    .filter((file) => file.endsWith(".md"))
    .map((file) => `/${kind}/${file.slice(0, -3)}`);

/** Hidden posts prerender too: they are unlisted, not gone. The sitemap skips them. */
export const prerender = [...pages, ...slugs("posts"), ...slugs("projects"), "/404"];
