import type { Component, View } from "@effect/ui";
import { Html, type BrowserHost } from "@effect/ui/html";
import { Schema, type Layer } from "effect";
import { css } from "../../styled-system/css";

/**
 * Islands: the interactive parts of an otherwise static page. Each lives in
 * `app/islands/<Name>.ts` as `export const <Name> = Island.define({...})`, and
 * is called in a view like a component. The page around it is rendered once to a
 * string and never hydrated; the island is rendered as a root of its own on the
 * server (`./server.ts`) and hydrated as one in the browser (`./hydrate.ts`).
 */

/** When the browser hydrates the island: once it scrolls into view, or once the main thread is idle. */
export type Load = "visible" | "idle";

/** What a Vite glob of `app/islands/*.ts` finds. The file name is the island's name. */
export interface Definition {
  readonly "~island": true;
  readonly load: Load;
  readonly layers: ReadonlyArray<Layer.Layer<never>>;
  /** The root the server renders and the browser hydrates. Loads the component's chunk. */
  readonly root: () => Promise<Root>;
  /** Props to JSON, and back: one Schema for both ends, so they cannot drift. */
  readonly encodeProps: (props: unknown) => unknown;
  readonly decodeProps: (json: unknown) => unknown;
}

/**
 * A root whose Model and messages are no concern of the island. `define` ties
 * its props to the Schema, which is the only place their type is known.
 */
export type Root = Component.Members<string, any, any, any, any, never, View.Elements, any> &
  BrowserHost.HtmlRoot<View.Elements>;

export interface Slot {
  readonly definition: Definition;
  readonly props: unknown;
  readonly load: Load;
}

/**
 * Placeholders waiting for the server to fill them. A view puts a token in the
 * page and the props here, and the server swaps the token for the island's own
 * render (`./server.ts`). Props never go through the markup, so the server
 * matches the token exactly instead of parsing attributes.
 */
export const slots = new Map<string, Slot>();
export const SLOT_ATTR = "data-island-slot";
let tokens = 0;

type Args<Props> = {} extends Props
  ? [options?: { props?: Props; load?: Load }]
  : [options: { props: Props; load?: Load }];

export const define = <S extends Schema.Codec<any, any>>(options: {
  /** Imported lazily, so the component lands in a chunk of its own. */
  component: () => Promise<Component.Any>;
  props: S;
  /** Layers the component needs in the browser, such as the shared API layer. */
  layers?: ReadonlyArray<Layer.Layer<never>>;
  load?: Load;
  /**
   * For a component that is provided a Layer with `server: false`: it cannot be a
   * root, so the island wraps it, and this draws what the page shows until the Layer is up.
   */
  fallback?: (h: Html.H<never>, props: S["Type"]) => View.Content<never, never>;
}) => {
  const json = Schema.toCodecJson(options.props);
  let root: Promise<Root> | undefined;
  const meta: Definition = {
    "~island": true,
    load: options.load ?? "visible",
    layers: options.layers ?? [],
    root: () => (root ??= options.component().then(wrap)),
    encodeProps: (props) => Schema.encodeUnknownSync(json)(props),
    decodeProps: (encoded) => Schema.decodeUnknownSync(json)(encoded),
  };
  const wrap = (component: Component.Any): Root =>
    options.fallback === undefined
      ? (component as unknown as Root)
      : (Html.component({
          name: "Island",
          props: options.props,
          model: Schema.Struct({}),
          message: Schema.Never,
        }).make({
          init: () => ({}),
          update: ($) => $.model,
          view: (h) =>
            (component as unknown as Provided)(h, {
              key: "island",
              props: h.props,
              fallback: () => options.fallback!(h as never, h.props),
            }),
        }) as unknown as Root);

  type Provided = (
    h: Html.H<never>,
    options: { key: string; props: S["Type"]; fallback: () => View.Content<never, never> },
  ) => View.Content<never, never>;

  const place = <M>(h: Html.H<M>, ...[call]: Args<S["Type"]>) => {
    const token = `i${tokens++}`;
    slots.set(token, {
      definition: self,
      props: meta.encodeProps(call?.props ?? {}),
      load: call?.load ?? meta.load,
    });
    // `display: contents` keeps the island's element in the surrounding grid or flow.
    return h.div.attr(SLOT_ATTR, token).class(css({ display: "contents" }));
  };
  // The registry holds this function, so a slot names its island by this very object.
  const self: Definition = Object.assign(place, meta);
  return self as typeof self & typeof place;
};

export const isDefinition = (value: unknown): value is Definition =>
  typeof value === "function" && "~island" in value;
