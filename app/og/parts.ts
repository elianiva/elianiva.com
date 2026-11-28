import type { OgContent } from "./og-content";
import {
  CREAM,
  DISPLAY_FONT,
  HEADING_INK,
  MONO_FONT,
  PAGE_GRADIENT,
  PINK_200,
  PINK_300,
  PINK_400,
  PINK_700,
  SKY_200,
  YELLOW_300,
} from "./og-tokens";

/**
 * Shared pieces of the OG card, as plain Takumi nodes. Each one transcribes a
 * pattern from the site, so the card reads as the site. Containers carry the
 * `div` tag and block preset and text carries `span`, the same shapes
 * `takumi-js/helpers/jsx` produced from the old React components, so the
 * layout is identical.
 */

export type OgStyle = Record<string, string | number>;

export type OgNode =
  | {
      type: "container";
      tagName: "div";
      preset: { display: "block" };
      style: OgStyle;
      children: OgNode[];
    }
  | { type: "text"; tagName: "span"; text: string; style: OgStyle };

export function box(style: OgStyle, children: OgNode[] = []): OgNode {
  return { type: "container", tagName: "div", preset: { display: "block" }, style, children };
}

export function span(text: string, style: OgStyle): OgNode {
  return { type: "text", tagName: "span", text, style };
}

/** `h-2` / `w-2` — the thickness of the pink frame. */
const FRAME_BORDER = 8;
/** `border-2` — the pink outline around the corner tabs. */
const TAB_BORDER = 2;

/** The 8px `bg-pink-200` border `Frame` draws around the whole page. */
export function ogCard(children: OgNode[]): OgNode {
  return box(
    {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      backgroundImage: PAGE_GRADIENT,
      padding: 22,
    },
    [
      box(
        {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          position: "relative",
          border: `${FRAME_BORDER}px solid ${PINK_200}`,
        },
        [
          cornerTabs(),
          box(
            {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              padding: 44,
            },
            children,
          ),
        ],
      ),
    ],
  );
}

/**
 * The `bg-yellow-300` and `bg-sky-200` tabs pinned to the top-left corner.
 *
 * Yellow sits at the corner itself and sky hangs off yellow's right edge,
 * sharing one 2px pink divider so the two read as a single joined tab
 * cluster. Yellow runs taller than sky, which leaves the stepped bottom edge
 * the site has.
 */
function cornerTabs(): OgNode {
  const tabBorder = `${TAB_BORDER}px solid ${PINK_200}`;
  return box(
    {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      position: "absolute",
      top: -FRAME_BORDER,
      left: -FRAME_BORDER,
    },
    [
      box({
        width: 160,
        height: 30,
        backgroundColor: YELLOW_300,
        borderRight: tabBorder,
        borderBottom: tabBorder,
      }),
      box({
        width: 156,
        height: 20,
        backgroundColor: SKY_200,
        borderRight: tabBorder,
        borderBottom: tabBorder,
      }),
    ],
  );
}

/**
 * The title block, centered: one ink color with the two-tone rule below it.
 */
export function cardHeading(text: string, fontSize: number, maxWidth?: number): OgNode {
  return box(
    {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      maxWidth: maxWidth ?? "100%",
      gap: 22,
    },
    [
      span(text, {
        fontFamily: DISPLAY_FONT,
        fontSize,
        fontWeight: 800,
        color: HEADING_INK,
        lineHeight: 1.12,
        letterSpacing: "0.025em",
        textTransform: "uppercase",
        textAlign: "center",
      }),
      headingRule(),
    ],
  );
}

/**
 * The rule under the title: a full-width `h-px bg-pink-200/50` hairline with
 * the `5ch bg-pink-200` and `2ch bg-pink-300` accent centered on it.
 * Pixel widths assume a ~44px title cap height: 5ch ≈ 130px, 2ch ≈ 52px.
 */
export function headingRule(): OgNode {
  return box(
    {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "center",
      width: "100%",
      height: 2,
      backgroundColor: PINK_200,
      opacity: 0.5,
    },
    [
      box({ width: 130, height: 2, backgroundColor: PINK_200, opacity: 1 }),
      box({ width: 52, height: 2, backgroundColor: PINK_300, opacity: 1 }),
    ],
  );
}

/** The label above the title: the site's `tracking-[0.3em]` mono eyebrow. */
export function cardEyebrow(content: OgContent): OgNode {
  const label = content.date ? `${content.kind} · ${content.date}` : content.kind;
  return box(
    {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      gap: 12,
    },
    [
      box({ width: 8, height: 8, backgroundColor: PINK_400 }),
      span(label, {
        fontFamily: MONO_FONT,
        fontSize: 16,
        fontWeight: 400,
        color: PINK_400,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
      }),
    ],
  );
}

/** The site's post-list tag chip: `bg-pink-50 border-pink-200`, mono. */
function tagChip(tag: string): OgNode {
  return box(
    {
      display: "flex",
      paddingLeft: 9,
      paddingRight: 9,
      paddingTop: 5,
      paddingBottom: 5,
      border: `1px solid ${PINK_200}`,
      backgroundColor: CREAM,
    },
    [
      span(`#${tag}`, {
        fontFamily: MONO_FONT,
        fontSize: 15,
        fontWeight: 400,
        color: PINK_700,
        letterSpacing: "0.02em",
      }),
    ],
  );
}

/** The tag row in the site's chip treatment. Empty when there are no tags. */
export function cardTags(content: OgContent): OgNode[] {
  if (content.tags.length === 0) return [];
  return [
    box(
      {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 10,
      },
      content.tags.map(tagChip),
    ),
  ];
}
