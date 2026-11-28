import { Component } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { AsyncResult } from "effect/reactivity";
import { homeSeoHead } from "../lib/seo";
import { GetContributions } from "../queries/GetContributions";
import { HomeGrid } from "../ui/home-grid";

/**
 * The home page. Everything on it is prerendered, so crawlers read it: the
 * GitHub heatmap comes from `GetContributions`, which the build runs against
 * the in-process Api routes (`GH_TOKEN` is set for the deploy, and the deploy
 * workflow runs daily to keep it fresh). `null` when there is no token or
 * GitHub failed, so the cell says so instead of showing a zero. The status
 * board, the last plays and the push tag need the browser and are filled in
 * after hydration (see `HomeGrid`).
 */
export const HomeNoDeps = Html.component({
  name: "Home",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
  queries: { contributions: { query: GetContributions, args: () => ({}) } },
}).make({
  init: () => ({}),
  update: ($) => $.model,
  head: () => [...homeSeoHead()],
  view: (h) => {
    const result = h.queries.contributions;
    return HomeGrid(h, { contributions: AsyncResult.isSuccess(result) ? result.value : null });
  },
});
export const Home = HomeNoDeps.pipe(Component.provide(GetContributions.layer));
