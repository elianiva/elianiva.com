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
