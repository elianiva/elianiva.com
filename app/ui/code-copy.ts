import { Command, Component, Subscription, UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Effect, Layer, Schema, Stream } from "effect";
import { css } from "../../styled-system/css";

/**
 * The copy button of a code block: hidden until the block is hovered or the
 * button is focused, a check mark for two seconds after a copy. It replaces
 * `src/components/code-copy.tsx`, which wrapped every `pre` in the rendered
 * article once it mounted. Here the block's view places one next to its `pre`.
 */
const COPY =
  "M216 32H88a8 8 0 0 0-8 8v16H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-16h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-56 176H48V64h112Zm48-48h-32V56a8 8 0 0 0-8-8H96V48h112z";
const CHECK =
  "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z";

export const CodeCopyMessage = UiSchema.TaggedEnum({
  ClickedCopy: {},
  Copied: {},
  FailedCopy: {},
  ResetCopied: {},
});

/** Writes the code to the clipboard. The browser allows it only from a click, which is where it runs. */
export class CopyCode extends Command.Service<CopyCode>()("ui/CopyCode", {
  args: { code: Schema.String },
  success: CodeCopyMessage,
}) {
  static readonly layer = this.toLayer(
    Effect.succeed(({ code }) =>
      Effect.tryPromise(() => navigator.clipboard.writeText(code)).pipe(
        Effect.match({
          onSuccess: () => CodeCopyMessage.Copied(),
          onFailure: () => CodeCopyMessage.FailedCopy(),
        }),
      ),
    ),
  );
}

export const CodeCopyNoDeps = Html.component({
  name: "CodeCopy",
  props: Schema.Struct({ code: Schema.String }),
  model: Schema.Struct({ copied: Schema.Boolean }),
  message: CodeCopyMessage,
}).make({
  init: () => ({ copied: false }),
  update: {
    ClickedCopy: ($) => $.run(CopyCode.make({ code: $.props.code })),
    Copied: ($) => $.evolve({ copied: true }),
    FailedCopy: ($) => $.model,
    ResetCopied: ($) => $.evolve({ copied: false }),
  },
  subscriptions: ({ model }) => [
    model.copied &&
      Subscription.make("reset", "copied", () =>
        Stream.fromEffect(Effect.as(Effect.sleep("2 seconds"), CodeCopyMessage.ResetCopied())),
      ),
  ],
  view: (h, { copied }) =>
    h.button
      .attrs({ type: "button", "aria-label": copied ? "Copied!" : "Copy code" })
      .class(
        css({
          position: "absolute",
          top: "2",
          right: "2",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "7",
          height: "7",
          p: "1.5",
          bg: "white/80",
          border: "1px solid",
          borderColor: "pink.200",
          color: "pink.700",
          cursor: "pointer",
          opacity: "0",
          transition: "opacity 200ms",
          _hover: { bg: "white", color: "pink.900" },
          _focusVisible: { opacity: "1", outline: "1px solid", outlineColor: "ring" },
          _groupHover: { opacity: "1" },
        }),
      )
      .on("click", CodeCopyMessage.ClickedCopy())
      .children(
        h.svg
          .attrs({ viewBox: "0 0 256 256", fill: "currentColor", width: "16", height: "16" })
          .children(h.path.attrs({ d: copied ? CHECK : COPY })),
      ),
});

export const CodeCopy = CodeCopyNoDeps.pipe(Component.provide(Layer.mergeAll(CopyCode.layer)));
