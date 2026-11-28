import { HtmlLocator, HtmlScene } from "@effect/ui/html/testing";
import { Locator } from "@effect/ui/testing";
import { Effect } from "effect";
import { describe, expect, it } from "vite-plus/test";
import { uses, usesUpdatedAt } from "../data/uses";
import { Uses } from "./Uses";

/** Renders the real page as a Scene, and hands back what a reader sees. */
const render = Effect.gen(function* () {
  const s = yield* HtmlScene.make(Uses, {});
  return {
    s,
    out: Locator.textOf(s.root).replace(/\s+/g, " "),
    articles: s.all(Locator.tag("article")),
  };
}).pipe(Effect.scoped, Effect.runSync);

describe("uses page render", () => {
  const items = uses.flatMap((section) => section.items);
  const totalItems = items.length;
  const updatedOn = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(usesUpdatedAt));

  it("renders the heading and every section", () => {
    const { out } = render;
    expect(out).toContain("Uses");
    for (const section of uses) {
      expect(out, `missing section ${section.title}`).toContain(section.title);
    }
  });

  it("no longer uses a table for items", () => {
    expect(render.s.all(Locator.tag("table"))).toHaveLength(0);
  });

  it("renders one article per item", () => {
    expect(render.articles).toHaveLength(totalItems);
    for (const item of items) {
      expect(render.out, `missing item ${item.name}`).toContain(item.name);
    }
  });

  it("renders the why reasoning as prose", () => {
    for (const item of items) {
      if (!item.why) continue;
      expect(render.out, `missing reasoning for ${item.name}`).toContain(item.why);
    }
  });

  it("labels swapFor blocks distinctly", () => {
    // The label must track the data: one per item that declares a swapFor.
    const swapped = items.filter((item) => item.swapFor);
    expect(render.s.all(Locator.text("swap", { exact: true }))).toHaveLength(swapped.length);
  });

  it("links external items safely", () => {
    const link = render.s.get(HtmlLocator.role("link", { name: /^Neovim/ }));
    expect(link.attrs?.href).toBe("https://neovim.io");
    expect(link.attrs?.rel).toBe("noopener noreferrer");
  });

  it("leaks no unrendered Markdown into the output", () => {
    expect(render.out).not.toContain("](/posts/");
    expect(render.out).not.toContain("`nums`");
  });

  it("renders the updated date and the item count", () => {
    expect(render.out).toContain(updatedOn);
    expect(render.out).toContain(`${totalItems} items across ${uses.length} groups`);
  });

  it("gives every item the same plate, not just the first in a section", () => {
    // The treatment is uniform, so adding an item anywhere needs no special case.
    const plates = render.articles.map((article) => article.attrs?.class);
    expect(new Set(plates).size).toBe(1);
  });
});
