import { Head, Router, UiSchema } from "@effect/ui";
import { Html, HtmlHead } from "@effect/ui/html";
import { Schema } from "effect";
import { css } from "../styled-system/css";
import {
  Home,
  Music,
  Neighbours,
  Post,
  Posts,
  Project,
  Projects,
  Uses,
  Work,
} from "./pages/lazy.ts";
import { AppRoute } from "./routes";
import { Footer } from "./ui/footer";
import { FloatingShapes } from "./ui/floating-shapes";
import { Frame } from "./ui/frame";
import { LostPage } from "./ui/lost-page";
import { NavigationStrip } from "./ui/navigation";

export const AppMessage = UiSchema.TaggedEnum({
  ChangedRoute: { route: AppRoute },
});

/** The 404. It sets its own head, since no page owns it. */
const NotFound = Html.component({
  name: "NotFound",
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  head: () => [Head.title("Not found"), HtmlHead.meta({ name: "robots", content: "noindex" })],
  view: (h) => LostPage(h, { section: "page", home: "/" }),
});

const skipLink = css({
  position: "absolute",
  width: "1px",
  height: "1px",
  p: "0",
  m: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0",
  _focus: {
    top: "4",
    left: "4",
    width: "auto",
    height: "auto",
    m: "0",
    px: "4",
    py: "2",
    clip: "auto",
    overflow: "visible",
    whiteSpace: "normal",
    bg: "pink.600",
    color: "white",
    rounded: "md",
    zIndex: "50",
    outline: "none",
    boxShadow: "0 0 0 3px var(--colors-pink-800)",
  },
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
  head: () => [
    Head.titleTemplate((title) => `${title} · elianiva`),
    HtmlHead.lang("en"),
    HtmlHead.htmlClass(css({ height: "100%" })),
    HtmlHead.bodyClass(css({ height: "100%", display: "flex", flexDirection: "column" })),
    HtmlHead.meta({ name: "viewport", content: "width=device-width, initial-scale=1" }),
    HtmlHead.meta({ name: "theme-color", content: "#fff5f0" }),
    HtmlHead.link({ rel: "icon", href: "/favicon.png", type: "image/png", sizes: "32x32" }),
    HtmlHead.link({ rel: "alternate", href: "/rss.xml", type: "application/rss+xml" }),
  ],
  view: (h, { route }) => {
    const key = AppRoute.printPath(route);
    return h.div.class(css({ display: "contents" })).children(
      h.a.attr("href", "#main-content").class(skipLink).children("Skip to main content"),
      FloatingShapes(h, {}),
      Frame(h),
      NavigationStrip(h, { path: key }),
      h.main
        .attrs({ id: "main-content", role: "main" })
        .class(css({ position: "relative", zIndex: "0", md: { mt: "-1px" } }))
        .children(
          AppRoute.match(route, {
            Home: () => Home(h, { key, fallback: () => h.div }),
            Posts: () => Posts(h, { key, fallback: () => h.div }),
            Post: ({ params }) =>
              Post(h, { key, props: { slug: params.slug }, fallback: () => h.div }),
            Projects: () => Projects(h, { key, fallback: () => h.div }),
            Project: ({ params }) =>
              Project(h, { key, props: { slug: params.slug }, fallback: () => h.div }),
            Work: () => Work(h, { key, fallback: () => h.div }),
            Uses: () => Uses(h, { key, fallback: () => h.div }),
            Neighbours: () => Neighbours(h, { key, fallback: () => h.div }),
            Music: () => Music(h, { key, fallback: () => h.div }),
            NotFound: () => NotFound(h, { key }),
          }),
        ),
      Footer(h),
    );
  },
});
