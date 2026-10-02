import { describe, expect, it } from "vite-plus/test";
import { prerender } from "react-dom/static";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  type AnyRoute,
} from "@tanstack/react-router";
import { Route } from "./uses";
import { uses, usesUpdatedAt } from "~/data/uses";

/** Renders the real route component through a router, as the app does. */
async function html(): Promise<string> {
  const rootRoute = createRootRoute();
  const usesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/uses",
    component: Route.options.component as never,
  });
  const routeTree = rootRoute.addChildren([usesRoute as unknown as AnyRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/uses"] }),
  });

  await router.load();

  const result = await prerender(<RouterProvider router={router} />);
  const prelude = (result as { prelude: ReadableStream<Uint8Array> | string }).prelude;
  if (typeof prelude === "string") return prelude;
  const decoder = new TextDecoder();
  const reader = prelude.getReader();
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) out += decoder.decode(value, { stream: true });
  }
  return out + decoder.decode();
}

/**
 * The words a reader actually sees. React's SSR separates adjacent text nodes
 * with `<!-- -->` and tags styled runs in their own element, so a heading whose
 * first letter is coloured separately arrives as `<span>U</span>ses`. Inline
 * elements vanish so words stay whole; block elements become a space so they
 * do not run together. Entities are decoded last, so a string straight from the
 * data compares equal to its rendered form. Assertions about visible wording go
 * through this; structural checks use the raw markup.
 */
function text(markup: string): string {
  return markup
    .replace(/<!--.*?-->/g, "")
    .replace(/<\/?(?:span|a|b|i|em|strong|small|sup|sub|code)\b[^>]*>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

describe("uses page render", () => {
  const totalItems = uses.reduce((sum, section) => sum + section.items.length, 0);
  const updatedOn = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(usesUpdatedAt));

  it("renders the heading and every section", async () => {
    const out = text(await html());
    expect(out).toContain("Uses");
    for (const section of uses) {
      expect(out, `missing section ${section.title}`).toContain(section.title);
    }
  });

  it("no longer uses a table for items", async () => {
    expect(await html()).not.toContain("<table");
  });

  it("renders one article per item", async () => {
    const markup = await html();
    expect(markup.match(/<article/g) ?? []).toHaveLength(totalItems);
    const out = text(markup);
    for (const section of uses) {
      for (const item of section.items) {
        expect(out, `missing item ${item.name}`).toContain(item.name);
      }
    }
  });

  it("renders the why reasoning as prose", async () => {
    const out = text(await html());
    for (const item of uses.flatMap((section) => section.items)) {
      if (!item.why) continue;
      expect(out, `missing reasoning for ${item.name}`).toContain(item.why);
    }
  });

  it("labels swapFor blocks distinctly", async () => {
    // The swap note is optional, so the label must track the data: one per item
    // that declares a swapFor, and never an empty label for the ones that do not.
    const out = await html();
    const swapped = uses.flatMap((section) => section.items).filter((item) => item.swapFor);
    expect(out.match(/>swap</g) ?? []).toHaveLength(swapped.length);
  });

  it("links external items safely", async () => {
    const out = await html();
    expect(out).toContain('href="https://neovim.io"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it("leaks no unrendered Markdown into the output", async () => {
    const out = await html();
    expect(out).not.toContain("](/posts/");
    expect(out).not.toContain("`nums`");
  });

  it("renders the updated date and the item count", async () => {
    const out = text(await html());
    expect(out).toContain(updatedOn);
    expect(out).toContain(`${totalItems} items across ${uses.length} groups`);
  });

  it("shows how many items each section holds", async () => {
    const out = text(await html());
    for (const section of uses) {
      expect(out, `missing count for ${section.title}`).toContain(
        String(section.items.length).padStart(2, "0"),
      );
    }
  });

  it("gives every item the same plate, not just the first in a section", async () => {
    const out = await html();
    // One bordered plate per item, each laid out as identity then reasoning
    // behind a divider. This is the whole design: the treatment is uniform, so
    // adding an item anywhere needs no special case.
    expect(out.match(/<article/g) ?? []).toHaveLength(totalItems);
    expect(out.match(/grid-cols-\[2\.5rem_1fr\] md:grid-cols-\[17rem_1fr\]/g) ?? []).toHaveLength(
      totalItems,
    );
  });

  it("separates the reasoning from the identity on small screens", async () => {
    // Below md the two columns collapse to one: the reasoning moves under the
    // identity, where it needs a top rule to stay distinct. Without it the name,
    // spec, note, and prose run together.
    const out = await html();
    expect(out.match(/col-start-2 md:col-start-auto/g) ?? []).toHaveLength(totalItems);
  });
});
