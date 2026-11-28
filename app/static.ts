import { drawShapes } from "./lib/shapes";

/**
 * What a static page does without an Effect runtime: the nav, the build date,
 * the hero word's pointer replay and the floating shapes, all in plain DOM.
 */
export const runStatic = () => {
  centerCurrentTicket();
  stampBuildDate();
  replayDelightful();
  const idle = window.requestIdleCallback ?? ((run: () => void) => setTimeout(run, 200));
  idle(drawShapes, { timeout: 1500 });
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
