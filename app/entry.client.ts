import { listenForCopies } from "./ui/code-copy";
import { runStatic } from "./static";

/**
 * Every page loads this file and nothing else up front. The page is static
 * HTML: this runs its plain-DOM behaviours, and loads the islands' code only
 * when the page holds some (`app/islands/client.ts`).
 */
listenForCopies();
runStatic();
if (document.querySelector("[data-island]")) void import("./island/client");

// Browsers without speculation rules (Safari, Firefox) fetch the next page on hover or touch instead.
if (!HTMLScriptElement.supports?.("speculationrules")) {
  const seen = new Set<string>();
  const warm = (event: Event) => {
    const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (
      !link ||
      link.origin !== location.origin ||
      /\.\w+$/.test(link.pathname) ||
      seen.has(link.href)
    )
      return;
    seen.add(link.href);
    const tag = document.createElement("link");
    tag.rel = "prefetch";
    tag.href = link.href;
    document.head.appendChild(tag);
  };
  document.addEventListener("pointerover", warm, { passive: true });
  document.addEventListener("touchstart", warm, { passive: true });
}
