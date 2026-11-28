import { Command, Component, UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Effect, Layer, Schema } from "effect";
import { css } from "../../styled-system/css";
import { Icon } from "./icons";
import { Button } from "./button";

const BackMessage = UiSchema.TaggedEnum({ ClickedBack: {}, Went: {} });

/** Goes back when the visitor came from this site, to the home page otherwise. */
export class GoBack extends Command.Service<GoBack>()("ui/GoBack", {
  args: {},
  success: BackMessage,
}) {
  static readonly layer = this.toLayer(
    Effect.succeed(() =>
      Effect.sync(() => {
        if (document.referrer && document.referrer.startsWith(window.location.origin)) {
          window.history.back();
        } else {
          window.location.href = "/";
        }
        return BackMessage.Went();
      }),
    ),
  );
}

const caption = css({
  fontFamily: "body",
  textTransform: "uppercase",
  fontWeight: "medium",
  letterSpacing: "wider",
  fz: "xs",
});

export const BackButtonNoDeps = Html.component({
  name: "BackButton",
  model: Schema.Struct({}),
  message: BackMessage,
}).make({
  init: () => ({}),
  update: ($, message) =>
    BackMessage.match(message, {
      ClickedBack: () => $.run(GoBack.make({})),
      Went: () => $.model,
    }),
  view: (h) =>
    h.div
      .class(
        css({
          display: "flex",
          gap: "2",
          mb: "4",
          alignItems: "center",
          justifyContent: "center",
        }),
      )
      .children(
        Button(h, { variant: "ghost" })
          .attr("type", "button")
          .on("click", BackMessage.ClickedBack())
          .children(
            Icon(h, "arrow-left", { className: css({ width: "4", height: "4" }) }),
            h.span.class(caption).children("Back"),
          ),
        Button(h, { variant: "ghost", as: "a" })
          .attr("href", "/")
          .children(
            Icon(h, "house", { className: css({ width: "4", height: "4" }) }),
            h.span.class(caption).children("Home"),
          ),
      ),
});

export const BackButton = BackButtonNoDeps.pipe(Component.provide(Layer.mergeAll(GoBack.layer)));
