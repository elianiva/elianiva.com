import { createFileRoute } from "@tanstack/react-router";
import { UsesPage } from "~/features/uses/components/uses-page";
import { seo, defaultOgImageUrl } from "~/lib/seo";

export const Route = createFileRoute("/uses")({
  component: UsesPage,
  head: () =>
    seo({
      title: "Uses",
      description: "Hardware, software, and camera gear I actually use, and why I picked it.",
      ogImage: defaultOgImageUrl("Uses", "Stuff I actually use"),
      path: "/uses",
    }),
});
