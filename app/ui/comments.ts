import { Subscription, UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Effect, Schema, Stream } from "effect";
import { css } from "../../styled-system/css";

const CommentsMessage = UiSchema.TaggedEnum({ Loaded: {} });

/**
 * The giscus comment thread. Effect UI's head cannot hold a `<script>`, and a
 * script in the body never runs when it is rendered, so the browser adds it
 * once the component is up (a Subscription runs on the client only).
 */
export const Comments = Html.component({
  name: "Comments",
  model: Schema.Struct({ loaded: Schema.Boolean }),
  message: CommentsMessage,
}).make({
  init: () => ({ loaded: false }),
  update: ($) => $.evolve({ loaded: true }),
  subscriptions: ({ model }) => [
    !model.loaded &&
      Subscription.make("giscus", "load", () =>
        Stream.fromEffect(
          Effect.sync(() => {
            const script = document.createElement("script");
            script.src = "https://giscus.app/client.js";
            script.async = true;
            script.crossOrigin = "anonymous";
            for (const [key, value] of Object.entries({
              repo: "elianiva/elianiva.com",
              "repo-id": "MDEwOlJlcG9zaXRvcnkzMDE0NjE4NDU=",
              category: "General",
              "category-id": "DIC_kwDOEffxVc4CRq7s",
              mapping: "pathname",
              strict: "0",
              "reactions-enabled": "1",
              "emit-metadata": "0",
              "input-position": "bottom",
              theme: "light",
              lang: "en",
            })) {
              script.setAttribute(`data-${key}`, value);
            }
            document.getElementById("comments")?.appendChild(script);
            return CommentsMessage.Loaded();
          }),
        ),
      ),
  ],
  view: (h) =>
    h.div
      .class(css({ mt: "14" }))
      .children(
        h.div.attr("id", "comments"),
        h.p
          .class(css({ mt: "4 !important", fz: "sm", color: "pink.950/70" }))
          .children("If you don't see any comment section, please turn off your adblocker :)"),
      ),
});
