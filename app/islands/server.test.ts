import { Html } from "@effect/ui/html";
import { Context, Schema } from "effect";
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

const { layerHttp } = await import("./server");

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
