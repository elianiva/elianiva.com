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

export function OgImage({ spec }: { spec: OgImageSpec }) {
  const content = toOgContent(spec);
  return (
    <OgCard>
      <EditorialLayout content={content} />
    </OgCard>
  );
}
