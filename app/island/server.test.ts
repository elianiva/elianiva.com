import { Html } from "@effect/ui/html";
import { Context, Effect, Schema } from "effect";
import { HttpRouter } from "effect/http";
import { describe, expect, it, vi } from "vite-plus/test";
import { AppRoute } from "../routes";

const mode = { throws: false };

vi.mock("../App", () => ({
  App: Html.component({
    name: "App",
    props: Schema.Struct({ route: AppRoute }),
    model: Schema.Struct({}),
    message: Schema.Never,
  }).make({
    init: () => ({}),
    update: ($) => $.model,
    view: (h) => {
      if (mode.throws) throw new Error("boom");
      return h.p("hello");
    },
  }),
}));

const { layerHttp, renderIslands } = await import("./server");
const { Island } = await import("./index");
const { slots } = await import("./define");
const { Quiz } = await import("../islands/Quiz");

const get = async (path: string) => {
  const { handler, dispose } = HttpRouter.toWebHandler(
    layerHttp({ budget: "50 millis", document: (page) => `<main>${page.html}</main>` }),
    { disableLogger: true },
  );
  try {
    return await handler(new Request(`http://localhost${path}`), Context.empty() as never);
  } finally {
    await dispose();
  }
};

describe("island server", () => {
  it("renders a page", async () => {
    const response = await get("/uses");
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("hello");
  });

  it("answers 500 when a view throws, so the build fails instead of writing the page", async () => {
    mode.throws = true;
    const response = await get("/uses");
    mode.throws = false;
    expect(response.status).toBe(500);
  });

  it("answers 404 for the catch-all route", async () => {
    expect((await get("/nowhere")).status).toBe(404);
  });
});

describe("islands", () => {
  const slot = (token: string, id: string) => {
    slots.set(token, { definition: Quiz, props: Quiz.encodeProps({ id }), load: "visible" });
    return `<div class="d_contents" data-island-slot="${token}"></div>`;
  };

  it("fills each placeholder by its token, numbering islands of one name in page order", async () => {
    const html = `<p>a</p>${slot("i9001", "jj-reflog")}<p>b</p>${slot("i9002", "jj-reflog")}<p>c</p>`;
    const { html: out, states } = await Effect.runPromise(renderIslands(html, "50 millis"));
    const ids = [...out.matchAll(/data-island-id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toEqual(["Quiz-0", "Quiz-1"]);
    expect(Object.keys(states)).toEqual(["Quiz-0", "Quiz-1"]);
    expect(out).toContain('data-island="Quiz"');
    expect(out).toContain('data-island-props="{&#34;id&#34;:&#34;jj-reflog&#34;}"');
    expect(out).toMatch(
      /^<p>a<\/p><div class="d_contents" data-island="Quiz"[^>]*>.+<\/div><p>b<\/p>/s,
    );
    expect(out).not.toContain("data-island-slot");
    expect(slots.has("i9001") || slots.has("i9002")).toBe(false);
  });

  it("fails on a token nobody registered", async () => {
    const html = '<div class="d_contents" data-island-slot="i9999"></div>';
    await expect(Effect.runPromise(renderIslands(html, "50 millis"))).rejects.toThrow(/i9999/);
  });

  it("round-trips props through their Schema", () => {
    const when = Island.define({
      component: () => Promise.reject(new Error("not rendered")),
      props: Schema.Struct({ at: Schema.Date, tags: Schema.Array(Schema.String) }),
    });
    const props = { at: new Date("2026-11-28T00:00:00Z"), tags: ["a", "b"] };
    const json = when.encodeProps(props);
    expect(json).toEqual({ at: "2026-11-28T00:00:00.000Z", tags: ["a", "b"] });
    expect(when.decodeProps(JSON.parse(JSON.stringify(json)))).toEqual(props);
    expect(() => when.decodeProps({ at: "nope", tags: [] })).toThrow();
  });
});
