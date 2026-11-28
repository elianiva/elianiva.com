import { runPostsFilter } from "./posts-filter";
import { drawShapes } from "./lib/shapes";

/**
 * What every page does without an Effect runtime, in plain DOM: the nav, the
 * build date, the hero word's pointer replay, the floating shapes, the archive
 * filter and the stack logos that fail to load.
 */
export const runStatic = () => {
  replayDelightful();
  runPostsFilter();
  fallBackLogos();
  // Decoration waits until the page has settled: the clock's first `Intl` call is slow enough to
  // delay the first paint, and a scroll before the first paint makes Chrome drop the page's
  // Largest Contentful Paint.
  setTimeout(() => {
    const idle = window.requestIdleCallback ?? ((run: () => void) => setTimeout(run, 0));
    idle(
      () => {
        stampBuildDate();
        if (!CSS.supports("scroll-initial-target", "nearest")) centerCurrentTicket();
        drawShapes();
      },
      { timeout: 2000 },
    );
  }, 3000);
};

/** On phones the strip scrolls sideways: bring the current page's ticket to the middle of it. */
const centerCurrentTicket = () => {
  const list = document.querySelector<HTMLElement>("[data-center-current]");
  const current = list?.querySelector<HTMLElement>("li:has([aria-current=page])");
  if (!list || !current || list.scrollWidth <= list.clientWidth) return;
  list.scrollTo({
    left: current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2,
    behavior: "smooth",
  });
};

/** The visitor's local date and time; the prerender carries no build-time date. */
const stampBuildDate = () => {
  const node = document.querySelector("[data-build-date]");
  if (node) {
    node.textContent = new Date().toLocaleString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }
};

/** Swapping the word for a clone restarts every `.delight-*` animation inside it. */
const replayDelightful = () => {
  const word = document.querySelector("[data-delight]");
  word?.addEventListener("mouseenter", () => {
    const letters = word.querySelector("[aria-hidden]");
    letters?.replaceWith(letters.cloneNode(true));
  });
};

/** A stack logo that does not load shows the first letter of its name instead. */
const fallBackLogos = () => {
  const swap = (img: HTMLImageElement) => {
    const letter = document.createElement("span");
    letter.textContent = img.dataset.logo ?? "";
    letter.className = "logo-letter";
    img.replaceWith(letter);
  };
  // `error` does not bubble, so listen while it travels down.
  document.addEventListener(
    "error",
    (event) => {
      const img = event.target;
      if (img instanceof HTMLImageElement && img.dataset.logo !== undefined) swap(img);
    },
    true,
  );
  // One that failed before this ran has already fired its event.
  for (const img of document.querySelectorAll<HTMLImageElement>("img[data-logo]")) {
    if (img.complete && img.naturalWidth === 0) swap(img);
  }
};
