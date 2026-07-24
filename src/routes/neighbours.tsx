import { createFileRoute } from "@tanstack/react-router";
import { neighbours } from "~/data/neighbours";
import { Heading } from "~/components/ui/heading";
import { seo, defaultOgImageUrl } from "~/lib/seo";

function NeighboursRoute() {
  return (
    <div className="mx-auto max-w-container pt-10 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <section className="relative">
          <Heading level={1}>Neighbours</Heading>
          <p className="text-sm md:text-base font-body text-pink-950/70 pt-2 pb-4">
            A bunch of cool people I know / interacted with on the web.
          </p>
        </section>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 py-4">
          {[...neighbours]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((neighbour) => (
              <a
                key={neighbour.url}
                href={neighbour.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative border border-pink-200/50 bg-linear-to-br from-white/60 via-pink-50/30 to-white/20 p-3 hover:bg-white/80 transition-all duration-150 block backdrop-blur-lg"
              >
                <div className="absolute -left-1 -top-1 size-2 border border-pink-200/50 bg-white" />
                <div className="absolute -right-1 -top-1 size-2 border border-pink-200/50 bg-white" />
                <div className="absolute -left-1 -bottom-1 size-2 border border-pink-200/50 bg-white" />
                <div className="absolute -right-1 -bottom-1 size-2 border border-pink-200/50 bg-white" />

                <div className="flex items-center gap-3">
                  {/* Initial badge */}
                  <div className="relative flex items-center justify-center border-2 border-pink-200/50 uppercase size-10 font-black text-sm bg-white/80 text-pink-600 shrink-0">
                    {neighbour.name[0]}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-semibold text-pink-800 group-hover:text-pink-600 underline underline-offset-2 decoration-pink-300/50 transition-colors">
                      {neighbour.name}
                    </p>
                    <p className="text-[11px] font-mono text-pink-950/40 truncate">
                      {neighbour.url.replace(/^https?:\/\//, "")}
                    </p>
                  </div>
                </div>
              </a>
            ))}
        </section>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/neighbours")({
  component: NeighboursRoute,
  head: () =>
    seo({
      title: "Neighbours",
      description: "Cool people I know on the web, go check them out!",
      ogImage: defaultOgImageUrl("Neighbours", "Cool people I know on the web"),
      path: "/neighbours",
    }),
});
