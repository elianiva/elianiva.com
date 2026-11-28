import type { Load } from "./define";

/**
 * Decides when each island is due. It imports no Effect code: the runtime
 * (`./hydrate.ts`) is fetched when the first island is due, so a page whose
 * islands are all off screen loads none of it.
 */

/**
 * The wrapper is `display: contents`, and so can be what the island draws first,
 * so neither has a box to observe: take the first element that has one.
 */
const boxOf = (el: HTMLElement): Element =>
  [...el.querySelectorAll("*")].find((child) => child.getClientRects().length > 0) ??
  el.firstElementChild ??
  el;

/** Resolves when the island's content is in the viewport, or the main thread is idle. */
const whenDue = (el: HTMLElement, load: Load) =>
  new Promise<void>((resolve) => {
    if (load === "idle") {
      (window.requestIdleCallback ?? ((run: () => void) => setTimeout(run, 200)))(() => resolve(), {
        timeout: 2000,
      });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          resolve();
        }
      },
      { rootMargin: "0px" },
    );
    observer.observe(boxOf(el));
  });

for (const el of document.querySelectorAll<HTMLElement>("[data-island]")) {
  void whenDue(el, el.dataset.islandLoad as Load).then(async () => {
    (await import("./hydrate")).hydrateIsland(el);
  });
}
