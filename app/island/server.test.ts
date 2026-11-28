import { Html } from "@effect/ui/html";
import { Context, Schema } from "effect";
import { HttpRouter } from "effect/http";
import { describe, expect, it, vi } from "vite-plus/test";
import { AppRoute } from "../routes";

const mode = { throws: false, quizzes: false };

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
      if (mode.quizzes) {
        return h.div.children(
          h.p("page"),
          Quiz(h, { props: { id: "first" } }),
          Quiz(h, { props: { id: "second" } }),
        );
      }
      return h.p("hello");
    },
  }),
}));

const { layerHttp } = await import("./server");
const { Island } = await import("./index");
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
  it("renders islands of one name inline, and keeps only their markers and state", async () => {
    mode.quizzes = true;
    let state: Record<string, unknown> = {};
    const { handler, dispose } = HttpRouter.toWebHandler(
      layerHttp({
        budget: "50 millis",
        document: (page) => {
          state = page.state;
          return `<main>${page.html}</main>`;
        },
      }),
      { disableLogger: true },
    );
    const html = await handler(new Request("http://localhost/uses"), Context.empty() as never)
      .then((response) => response.text())
      .finally(() => dispose());
    mode.quizzes = false;

    expect([...html.matchAll(/data-island="(\w+)"/g)].map((m) => m[1])).toEqual(["Quiz", "Quiz"]);
    const props = [...html.matchAll(/data-island-props="([^"]*)"/g)].map((m) => m[1]);
    expect(props.map((p) => p!.replace(/&(?:#34|quot);/g, '"'))).toEqual([
      '{"id":"first"}',
      '{"id":"second"}',
    ]);
    // Only the islands' own markers and state are left: nothing of the page around them.
    const opens = [...html.matchAll(/<!--\[([^>]*)-->/g)].map((m) => m[1]!);
    expect(opens.filter((path) => /^\/App\/Island\[[^/]+\]$/.test(path))).toHaveLength(2);
    expect(opens.every((path) => path.startsWith("/App/Island["))).toBe(true);
    const paths = Object.keys(state).filter((key) => key.startsWith("/"));
    expect(paths.length).toBeGreaterThanOrEqual(2);
    expect(paths.every((path) => path.startsWith("/App/Island["))).toBe(true);
    expect(state["~query"]).toEqual({});
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
