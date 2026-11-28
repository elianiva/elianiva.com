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

// Pages are separate documents, so the next one is warmed when the visitor is heading for its link:
// ForesightJS reads the pointer's trajectory, tab focus, scroll and touch, then we prerender where
// the browser can (speculation rules) and prefetch where it cannot.
void import("js.foresight").then(({ ForesightManager }) => {
  const canPrerender = HTMLScriptElement.supports?.("speculationrules") === true;
  const warm = (url: string) => {
    if (canPrerender) {
      const rules = document.createElement("script");
      rules.type = "speculationrules";
      rules.textContent = JSON.stringify({ prerender: [{ source: "list", urls: [url] }] });
      document.head.appendChild(rules);
    } else {
      const tag = document.createElement("link");
      tag.rel = "prefetch";
      tag.href = url;
      document.head.appendChild(tag);
    }
  };
  for (const link of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    if (link.origin !== location.origin || /\.\w+$/.test(link.pathname)) continue;
    if (link.pathname === location.pathname) continue;
    ForesightManager.instance.register({
      element: link,
      name: link.pathname,
      callback: () => warm(link.href),
    });
  }
});
