import { Command, Head, Router, UiSchema } from "@effect/ui";
import { Html, HtmlHead } from "@effect/ui/html";
import { Schema } from "effect";
import { css } from "../styled-system/css";
import { AppRoute } from "./routes";

export const AppMessage = UiSchema.TaggedEnum({
  ChangedRoute: { route: AppRoute },
});

export const App = Html.component({
  name: "App",
  props: Schema.Struct({ route: AppRoute }),
  model: Schema.Struct({ route: AppRoute }),
  message: AppMessage,
}).make({
  init: ($) => ({ route: $.props.route }),
  update: (_$, message) => AppMessage.match(message, { ChangedRoute: ({ route }) => ({ route }) }),
  subscriptions: ({ model }) => [
    Router.subscription(AppRoute, model.route, (route) => AppMessage.ChangedRoute({ route })),
  ],
  head: () => [Head.titleTemplate((title) => `${title} · elianiva`), HtmlHead.lang("en")],
  view: (h, { route }) =>
    h.main.class(css({ p: "8", color: "pink.950" })).children(
      AppRoute.match(route, {
        Home: () => h.h1.class(css({ fz: "3xl", fontWeight: "bold" })).children("elianiva"),
        Posts: () => h.h1("Posts"),
        Post: () => h.h1("Post"),
        Projects: () => h.h1("Projects"),
        Project: () => h.h1("Project"),
        Work: () => h.h1("Work"),
        Uses: () => h.h1("Uses"),
        Neighbours: () => h.h1("Neighbours"),
        Music: () => h.h1("Music"),
        NotFound: () => h.h1("Not found"),
      }),
    ),
});
void Command;
