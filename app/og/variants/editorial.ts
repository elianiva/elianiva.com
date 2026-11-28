import type { OgContent } from "../og-content";
import { fitTitleSize } from "../og-content";
import { box, cardEyebrow, cardHeading, cardTags, span, type OgNode } from "../parts";
import { DISPLAY_FONT, HEADING_INK, MONO_FONT, PINK_400 } from "../og-tokens";

/**
 * Big type and a lot of air. Closest to a print magazine opener, so it leans on
 * the display face and drops the mono down to the margins only.
 */
export function editorialLayout(content: OgContent): OgNode {
  return box(
    {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      gap: 34,
    },
    [
      cardEyebrow(content),
      box(
        {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          width: "100%",
        },
        [
          cardHeading(content.title, fitTitleSize(content.title), 980),
          ...(content.description
            ? [
                span(content.description, {
                  fontFamily: DISPLAY_FONT,
                  fontSize: 23,
                  fontWeight: 400,
                  color: HEADING_INK,
                  opacity: 0.7,
                  lineHeight: 1.55,
                  maxWidth: 820,
                  textAlign: "center",
                }),
              ]
            : []),
        ],
      ),
      box(
        {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          width: "100%",
        },
        [
          ...cardTags(content),
          span(content.domain, {
            fontFamily: MONO_FONT,
            fontSize: 13,
            fontWeight: 400,
            color: PINK_400,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }),
        ],
      ),
    ],
  );
}
