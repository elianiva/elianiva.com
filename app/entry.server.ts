import { layerHttp } from "@effect/ui/html/HtmlServerHttp";
import { document } from "virtual:@effect/ui/document";
import { App } from "./App";
import { AppRoute } from "./routes";

export default layerHttp(App, { routes: AppRoute, budget: "300 millis", document });

export const prerender = ["/", "/posts", "/work", "/uses", "/neighbours", "/music", "/projects"];
