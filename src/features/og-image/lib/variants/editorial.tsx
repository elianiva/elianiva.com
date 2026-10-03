import type { OgContent } from "../og-content";
import { fitTitleSize } from "../og-content";
import { CardEyebrow, CardHeading, CardTags } from "../parts";
import { DISPLAY_FONT, HEADING_INK, MONO_FONT, PINK_400 } from "../og-tokens";

/**
 * Big type and a lot of air. Closest to a print magazine opener, so it leans on
 * the display face and drops the mono down to the margins only.
 */
export function EditorialLayout({ content }: { content: OgContent }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 34,
      }}
    >
      <CardEyebrow content={content} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          width: "100%",
        }}
      >
        <CardHeading fontSize={fitTitleSize(content.title)} maxWidth={980}>
          {content.title}
        </CardHeading>
        {content.description ? (
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 23,
              fontWeight: 400,
              color: HEADING_INK,
              opacity: 0.7,
              lineHeight: 1.55,
              maxWidth: 820,
              textAlign: "center",
            }}
          >
            {content.description}
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          width: "100%",
        }}
      >
        <CardTags content={content} />
        <span
          style={{
            fontFamily: MONO_FONT,
            fontSize: 13,
            fontWeight: 400,
            color: PINK_400,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }}
        >
          {content.domain}
        </span>
      </div>
    </div>
  );
}
