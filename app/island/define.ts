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

/** The root every island is wrapped in, and so the name in the path of every island instance. */
export const WRAPPER = "Island";

/** FNV-1a, in base 36: letters and digits only, so it is safe in a path. */
const hash = (text: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(36);
};

/** When the browser hydrates the island: once it scrolls into view, or once the main thread is idle. */
export type Load = "visible" | "idle";

/** What a Vite glob of `app/islands/*.ts` finds. The file name is the island's name. */
export interface Definition {
  readonly "~island": true;
  /** The file name under `app/islands/`. The server sets it before any page renders. */
  file: string;
  /** The root once `root()` has resolved: a view needs it at once, so the server preloads every island. */
  resolved: Root | undefined;
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
   * For a component that is provided a Layer with `server: false`: what the page
   * shows until the Layer is up.
   */
  fallback?: (h: Html.H<never>, props: S["Type"]) => View.Content<never, never>;
}) => {
  const json = Schema.toCodecJson(options.props);
  let root: Promise<Root> | undefined;
  const meta: Definition = {
    "~island": true,
    file: "",
    resolved: undefined,
    load: options.load ?? "visible",
    layers: options.layers ?? [],
    root: () =>
      (root ??= options.component().then((component) => (self.resolved = wrap(component)))),
    encodeProps: (props) => Schema.encodeUnknownSync(json)(props),
    decodeProps: (encoded) => Schema.decodeUnknownSync(json)(encoded),
  };
  // Always wrapped: an island is hydrated alone, and only an instance with a child component of its
  // own has markers around its nodes for the browser to find. A plain component child has none.
  const wrap = (component: Component.Any): Root =>
    Html.component({
      name: WRAPPER,
      props: options.props,
      model: Schema.Struct({}),
      message: Schema.Never,
    }).make({
      init: () => ({}),
      update: ($) => $.model,
      view: (h) =>
        (component as unknown as Provided)(h as never, {
          key: "island",
          props: h.props,
          // A component provided a Layer with `server: false` shows this until the Layer is up.
          ...(options.fallback && { fallback: () => options.fallback!(h as never, h.props) }),
        }),
    }) as unknown as Root;

  type Provided = (
    h: Html.H<never>,
    options: { key: string; props: S["Type"]; fallback?: () => View.Content<never, never> },
  ) => View.Content<never, never>;

  const place = <M>(h: Html.H<M>, ...[call]: Args<S["Type"]>) => {
    const { file: name, resolved } = self;
    if (resolved === undefined) {
      throw new Error(`The island ${name || "(unnamed)"} was not preloaded`);
    }
    const props = call?.props ?? {};
    const json = JSON.stringify(meta.encodeProps(props));
    // The island is an ordinary child of the page. Its key tells islands of one name apart by their props.
    return h.div
      .attrs({
        "data-island": name,
        "data-island-load": call?.load ?? meta.load,
        "data-island-props": json,
      })
      .class(css({ display: "contents" }))
      .children(
        (resolved as unknown as Provided)(h as never, { key: name + hash(json), props }) as never,
      );
  };

  // The registry holds this function, so a slot names its island by this very object.
  const self: Definition = Object.assign(place, meta);
  return self as typeof self & typeof place;
};

export const isDefinition = (value: unknown): value is Definition =>
  typeof value === "function" && "~island" in value;
