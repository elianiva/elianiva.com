import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";

/**
 * The interactive parts of an otherwise static page. Each is an Effect UI
 * component hydrated into a root of its own (`app/islands/client.ts`); the
 * page around it is never hydrated.
 */
export type IslandName = "Quiz" | "Comments" | "StatusTile" | "ListeningCell" | "LastPushTag";

/** When the browser hydrates the island: once it scrolls near, or once the main thread is idle. */
export type IslandLoad = "visible" | "idle";

/** Read by the server, which replaces the placeholder, and by `Island` itself. */
export const PROPS_ATTR = "data-island-props";

/**
 * A placeholder in a static page's view. `renderIslands` (server) fills it
 * with the island's own rendered HTML, so the page stays a plain view with no
 * Model and nothing to hydrate. `id` must be unique on the page: it keys the
 * island's serialized state.
 *
 * The wrapper is `display: contents`, so the island's element sits in the
 * surrounding grid or flow as if the wrapper were not there.
 */
export const Island = <M>(
  h: Html.H<M>,
  options: { name: IslandName; id: string; load: IslandLoad; props?: object },
) =>
  h.div
    .attrs({
      "data-island": options.name,
      "data-island-id": options.id,
      "data-island-load": options.load,
      // `encodeURIComponent` leaves `'` alone; it is the only character HTML escaping would touch.
      [PROPS_ATTR]: encodeURIComponent(JSON.stringify(options.props ?? {})).replace(/'/g, "%27"),
    })
    .class(css({ display: "contents" }));
