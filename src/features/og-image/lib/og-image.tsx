import { fontFromUrl } from "takumi-js/helpers";
import { z } from "zod";
import { toOgContent } from "./og-content";
import { OgCard } from "./parts";
import { EditorialLayout } from "./variants/editorial";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export type OgImageSpec =
  | { type: "default"; title: string; subtitle?: string }
  | { type: "post"; title: string; date: string; tags: string[]; description: string };

export const ogImageSpecSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("default"),
    title: z.string().min(1).max(120),
    subtitle: z.string().max(200).optional(),
  }),
  z.object({
    type: z.literal("post"),
    title: z.string().min(1).max(120),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tags: z.array(z.string().min(1).max(30)).max(6),
    description: z.string().max(300),
  }),
]);

/**
 * Brand fonts, pinned to a commit via jsDelivr (immutable, cacheable).
 *
 * Why not self-hosted /assets/fonts? The worker cannot subrequest its own
 * origin — edge returns HTTP 522 (verified in prod). External egress works.
 * Fonts change ~never; bump FONTS_REF when they do.
 */
const FONTS_REF = "e8d6f52b57e60184a754d434a1f74f589d8a3190";
const FONTS_BASE = `https://cdn.jsdelivr.net/gh/elianiva/elianiva.com@${FONTS_REF}/public/assets/fonts`;

export function ogFonts() {
  return [
    fontFromUrl(`${FONTS_BASE}/google-sans.ttf`),
    fontFromUrl(`${FONTS_BASE}/ibm-plex-mono.ttf`),
  ];
}

export function OgImage({ spec }: { spec: OgImageSpec }) {
  const content = toOgContent(spec);
  return (
    <OgCard>
      <EditorialLayout content={content} />
    </OgCard>
  );
}
