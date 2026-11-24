import { createFileRoute } from "@tanstack/react-router";
import { Box, Cell, Fill, PageHead, STAMP_CYCLE, Stamp } from "~/components/box";
import { neighbours } from "~/data/neighbours";
import { cn } from "~/lib/utils";
import { seo, ogPageImageUrl } from "~/lib/seo";

const LETTER_TONES = ["text-yellow-200", "text-sky-200", "text-pink-200", "text-purple-200"];

/** Each neighbour is a compartment with their initial set huge, like a letterpress block. */
function NeighboursRoute() {
  const people = [...neighbours].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <Box>
      <PageHead
        title="Neighbours"
        tone="sky"
        kicker="A bunch of cool people I know or have run into on the web. Go say hi."
        aside={
          <>
            <p className="mt-auto font-display text-7xl leading-none font-extrabold text-pink-950 tabular-nums">
              {people.length}
            </p>
            <p className="font-mono text-[11px] text-pink-950/60">sites worth a visit</p>
          </>
        }
      />
      {people.map((person, i) => (
        <Cell key={person.url} as="article" className="overflow-hidden">
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute -right-3 -bottom-10 font-display text-[11rem] leading-none font-extrabold transition-transform duration-300 ease-out",
              LETTER_TONES[i % 4],
            )}
          >
            {person.name[0]}
          </span>
          <a
            href={person.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-4 focus-visible:after:outline-pink-500"
          >
            <Stamp tone={STAMP_CYCLE[i % 4]} className="transition-transform duration-300">
              <span className="font-display text-base font-bold">{person.name}</span>
            </Stamp>
            <span className="relative mt-2 block truncate font-mono text-[11px] text-pink-950/70">
              {person.url.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
            </span>
          </a>
        </Cell>
      ))}
      <Fill used={people.length} />
    </Box>
  );
}

export const Route = createFileRoute("/neighbours")({
  component: NeighboursRoute,
  head: () =>
    seo({
      title: "Neighbours",
      description: "Cool people I know on the web, go check them out!",
      ogImage: ogPageImageUrl("neighbours"),
      path: "/neighbours",
    }),
});
