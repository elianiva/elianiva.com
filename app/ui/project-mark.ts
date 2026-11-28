import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";
import type { Style } from "./box";

const PROJECT_ICONS: Record<string, string> = {
  meiro: "/assets/project-icons/meiro.webp",
  nook: "/assets/project-icons/nook.svg",
  quorum: "/assets/project-icons/quorum.webp",
  mizook: "/assets/project-icons/mizook.webp",
};

/**
 * The project's app icon on a tilted tile, or its first letter when it has
 * none. 44px unless `style` sizes it.
 */
export const ProjectMark = <M>(
  h: Html.H<M>,
  options: { slug: string; title: string; style?: Style },
) => {
  const { slug, title, style } = options;
  const icon = PROJECT_ICONS[slug];
  return icon
    ? h.img
        .class(
          css(
            {
              width: "11",
              height: "11",
              rotate: "-6deg",
              border: "1px solid",
              borderColor: "pink.200",
              bg: "white",
              objectFit: "contain",
              p: "1",
              boxShadow: "0 3px 0 rgba(190,24,93,0.13)",
              transition: "transform 300ms cubic-bezier(0, 0, 0.2, 1)",
            },
            style,
          ),
        )
        .attrs({ src: icon, alt: "", width: "44", height: "44" })
    : h.span
        .class(
          css(
            {
              display: "grid",
              width: "11",
              height: "11",
              rotate: "-6deg",
              placeItems: "center",
              border: "1px solid",
              borderColor: "pink.200",
              bg: "white",
              fontFamily: "display",
              fz: "xl",
              fontWeight: "extrabold",
              color: "pink.500",
              boxShadow: "0 3px 0 rgba(190,24,93,0.13)",
              transition: "transform 300ms cubic-bezier(0, 0, 0.2, 1)",
            },
            style,
          ),
        )
        .children(title[0] ?? "");
};
