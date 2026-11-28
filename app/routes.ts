import { Route } from "@effect/ui";
import { Schema } from "effect";

/** Every page of the site. The `/*` route is the 404. */
export const AppRoute = Route.union({
  Home: Route.make("/"),
  Posts: Route.make("/posts"),
  Post: Route.make("/posts/:slug", { params: { slug: Schema.String } }),
  Projects: Route.make("/projects"),
  Project: Route.make("/projects/:slug", { params: { slug: Schema.String } }),
  Work: Route.make("/work"),
  Uses: Route.make("/uses"),
  Neighbours: Route.make("/neighbours"),
  Music: Route.make("/music"),
  NotFound: Route.make("/*"),
});
