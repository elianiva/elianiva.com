import { createFileRoute } from "@tanstack/react-router";
import { Box, Cell, PageHead } from "~/components/box";
import { RhythmGame } from "~/features/encore/rhythm-game";
import { seo } from "~/lib/seo";

/** The footer's rhythm game at full size, with room for the whole lane. */
function EncoreRoute() {
  return (
    <Box square={false}>
      <PageHead
        title="Encore"
        n={1}
        tone="pink"
        kicker="A four-lane rhythm game. Play it with D F J K, or tap the lanes."
        aside={
          <p className="mt-auto font-mono text-[11px] text-pink-950/60">
            Perfect ±42ms · Great ±83ms
          </p>
        }
      />
      <Cell span="w4" tone="graph" label="Stage" n={2}>
        <RhythmGame full />
      </Cell>
    </Box>
  );
}

export const Route = createFileRoute("/encore")({
  component: EncoreRoute,
  head: () =>
    seo({
      title: "Encore",
      description: "A small rhythm game on elianiva.com.",
      path: "/encore",
    }),
});
