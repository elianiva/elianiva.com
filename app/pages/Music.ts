import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { ogPageImageUrl, seoHead } from "../lib/seo";
import { Island } from "../islands/island";
import { Box } from "../ui/box";
import { LASTFM_PROFILE_URL, ext, textLink } from "../ui/music-body";
import { PageHead } from "../ui/pagehead";

export const Music = Html.component({
  name: "Music",
  props: Schema.Struct({}),
  model: Schema.Struct({}),
  message: Schema.Never,
}).make({
  init: () => ({}),
  update: ($) => $.model,
  head: () => [
    ...seoHead({
      title: "Music",
      description: "Recently played tracks via Last.fm",
      ogImage: ogPageImageUrl("music"),
      path: "/music",
    }),
  ],
  view: (h) =>
    Box(h).children(
      PageHead(h, {
        title: "Music",
        tone: "pink",
        kicker: [
          "These are just vibes, pure vibes. Scrobbled using ",
          h.a
            .attrs({ href: LASTFM_PROFILE_URL, ...ext })
            .class(textLink)
            .children("last.fm"),
          ".",
        ],
        aside: [Island(h, { name: "ScrobbleCount", id: "count", load: "visible" })],
      }),
      Island(h, { name: "MusicBody", id: "body", load: "visible" }),
    ),
});
