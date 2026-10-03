import type { ReactNode } from "react";
import type { OgContent } from "./og-content";
import {
  CREAM,
  DISPLAY_FONT,
  HEADING_FIRST_LETTER,
  HEADING_INK,
  MONO_FONT,
  PAGE_GRADIENT,
  PINK_200,
  PINK_300,
  PINK_400,
  SKY_200,
  YELLOW_300,
} from "./og-tokens";

/**
 * Shared pieces of the OG card. Each one is a direct transcription of a
 * pattern that already exists on the site, so the card reads as the site
 * without inventing a visual language of its own. There is exactly one
 * treatment per piece: every card ships the editorial composition.
 */

/** `h-2` / `w-2` — the thickness of the pink frame. */
const FRAME_BORDER = 8;
/** `border-2` — the pink outline around the corner tabs. */
const TAB_BORDER = 2;

/** The 8px `bg-pink-200` border `Frame` draws around the whole page. */
export function OgCard({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundImage: PAGE_GRADIENT,
        padding: 22,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          position: "relative",
          border: `${FRAME_BORDER}px solid ${PINK_200}`,
        }}
      >
        <CornerTabs />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            padding: 44,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * The `bg-yellow-300` and `bg-sky-200` tabs pinned to the top-left corner.
 *
 * This mirrors `Frame`: yellow sits at the corner itself and sky hangs off
 * yellow's right edge, sharing one 2px pink divider so the two read as a
 * single joined tab cluster. Yellow runs taller than sky, which leaves the
 * stepped bottom edge the site has, and the left frame bar resumes under
 * yellow.
 */
function CornerTabs() {
  const tabBorder = `${TAB_BORDER}px solid ${PINK_200}`;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        position: "absolute",
        top: -FRAME_BORDER,
        left: -FRAME_BORDER,
      }}
    >
      <div
        style={{
          width: 160,
          height: 30,
          backgroundColor: YELLOW_300,
          borderRight: tabBorder,
          borderBottom: tabBorder,
        }}
      />
      <div
        style={{
          width: 156,
          height: 20,
          backgroundColor: SKY_200,
          borderRight: tabBorder,
          borderBottom: tabBorder,
        }}
      />
    </div>
  );
}

/**
 * The `w-2.5` marker column `Heading` hangs in front of every section title:
 * a `size-2.5 bg-pink-200/50` square over a `size-2.5 bg-pink-200` one. The
 * card renders both squares at 16px so the marker still reads next to the
 * much larger card titles.
 */
function MarkerColumn() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          width: 16,
          height: 16,
          backgroundColor: PINK_200,
          opacity: 0.5,
        }}
      />
      <div style={{ display: "flex", width: 16, height: 16, backgroundColor: PINK_200 }} />
    </div>
  );
}

/**
 * `Heading`: the marker column over the title and the two-tone underline
 * below it. `pl-4` before the text, `font-extrabold`, `tracking-wide`.
 */
export function CardHeading({
  children,
  fontSize,
  maxWidth,
}: {
  children: string;
  fontSize: number;
  maxWidth?: number;
}) {
  const first = children.slice(0, 1);
  const rest = children.slice(1);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: maxWidth ?? "100%",
        gap: 22,
        paddingLeft: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 16 }}>
        <MarkerColumn />
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize,
            fontWeight: 800,
            color: HEADING_INK,
            lineHeight: 1.12,
            letterSpacing: "0.025em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: HEADING_FIRST_LETTER }}>{first}</span>
          {rest}
        </span>
      </div>
      <HeadingRule />
    </div>
  );
}

/**
 * The rule under a section title: a full-width `h-px bg-pink-200/50`
 * hairline with the `5ch bg-pink-200` and `2ch bg-pink-300` segments the
 * site draws over its first 7ch (`-bottom-0.5`, `h-0.5` for level 2).
 * Pixel widths assume a ~44px title cap height: 5ch ≈ 130px, 2ch ≈ 52px.
 */
export function HeadingRule() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-end",
        width: "100%",
        height: 2,
        backgroundColor: PINK_200,
        opacity: 0.5,
      }}
    >
      {/* `before:w-[5ch]` in `bg-pink-200`. */}
      <div style={{ width: 130, height: 2, backgroundColor: PINK_200, opacity: 1 }} />
      {/* `after:w-[2ch]` in `bg-pink-300`. */}
      <div style={{ width: 52, height: 2, backgroundColor: PINK_300, opacity: 1 }} />
    </div>
  );
}

/** The label above the title: the site's `tracking-[0.3em]` mono eyebrow. */
export function CardEyebrow({ content }: { content: OgContent }) {
  const label = content.date ? `${content.kind} · ${content.date}` : content.kind;
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
      <div style={{ width: 8, height: 8, backgroundColor: PINK_400 }} />
      <span
        style={{
          fontFamily: MONO_FONT,
          fontSize: 16,
          fontWeight: 400,
          color: PINK_400,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** The site's tag chip: `Badge variant="outline"` — square corners, mono. */
function TagChip({ tag }: { tag: string }) {
  return (
    <div
      style={{
        display: "flex",
        paddingLeft: 9,
        paddingRight: 9,
        paddingTop: 5,
        paddingBottom: 5,
        border: `1px solid ${PINK_200}`,
        backgroundColor: CREAM,
      }}
    >
      <span
        style={{
          fontFamily: MONO_FONT,
          fontSize: 15,
          fontWeight: 400,
          color: HEADING_INK,
          letterSpacing: "0.02em",
        }}
      >
        #{tag}
      </span>
    </div>
  );
}

/** The tag row in the site's chip treatment. Empty when there are no tags. */
export function CardTags({ content }: { content: OgContent }) {
  if (content.tags.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {content.tags.map((tag) => (
        <TagChip key={tag} tag={tag} />
      ))}
    </div>
  );
}

/** A thin full-width rule in pink. Kept for the section divider below the tags. */
export function Hairline() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: 1,
        backgroundColor: PINK_200,
      }}
    />
  );
}
