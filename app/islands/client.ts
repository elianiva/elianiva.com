import type { IslandLoad } from "./island";

/**
 * Decides when each island is due. It imports no Effect code: the runtime
 * (`./hydrate.ts`) is fetched when the first island is due, so a page whose
 * islands are all off screen loads none of it.
 */

/** Resolves when the island's content is near the viewport, or the main thread is idle. */
const whenDue = (el: HTMLElement, load: IslandLoad) =>
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
      { rootMargin: "300px" },
    );
    // The wrapper is `display: contents`, so it has no box to observe.
    observer.observe(el.firstElementChild ?? el);
  });

for (const el of document.querySelectorAll<HTMLElement>("[data-island]")) {
  void whenDue(el, el.dataset.islandLoad as IslandLoad).then(async () => {
    (await import("./hydrate")).hydrateIsland(el);
  });
}
