import { listenForCopies } from "./ui/code-copy";
import { runStatic } from "./static";

/**
 * Every page loads this file and nothing else up front. A static page with
 * islands (`app/islands/server.ts`) needs only the plain DOM behaviours below,
 * plus a chunk per island it holds. Every other page is one hydrated Effect UI
 * root (`legacy-client.ts`). The server writes `{"~islands": …}` as the state
 * of the first kind.
 */
const state = document.getElementById("state")!.textContent!;

if (state.startsWith('{"~islands"')) {
  listenForCopies();
  runStatic();
  if (document.querySelector("[data-island]")) void import("./islands/client");
} else {
  void import("./legacy-client");
}
