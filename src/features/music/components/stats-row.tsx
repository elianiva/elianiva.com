import { Heading } from "~/components/ui/heading";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

type Stats = {
  uniqueArtists: number;
  uniqueAlbums: number;
  totalTracks: number;
};

type StatCardProps = {
  label: string;
  title: string;
  value: React.ReactNode;
  extras?: React.ReactNode;
  className?: string;
};

function StatCard({ label, title, value, extras, className }: StatCardProps) {
  return (
    <Card className={cn("flex flex-col gap-3 py-5 border-0 ring-0 bg-transparent", className)}>
      <div className="flex justify-between items-center text-xs text-pink-950/40 uppercase tracking-wide pb-2 border-b border-dashed border-pink-200">
        <span className="text-pink-400 font-semibold tracking-wider">{title}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="font-display text-3xl md:text-4xl text-pink-400 tabular-nums">
          {value}
        </span>
      </div>
      {extras && (
        <div className="flex gap-2 flex-wrap items-baseline font-mono text-xs text-pink-950/40">
          {extras}
        </div>
      )}
    </Card>
  );
}

export function StatsRow({ stats, total }: { stats: Stats; total: number }) {
  return (
    <section className="py-4 md:py-8 relative with-box-underline">
      <Heading level={2} right={`${total.toLocaleString()} scrobbles`}>
        Summary
      </Heading>
      <div className="flex flex-wrap gap-4">
        <StatCard
          className="flex-1"
          title="artists"
          label="unique"
          value={stats.uniqueArtists.toLocaleString()}
        />
        <Separator orientation="vertical" />
        <StatCard
          className="flex-1"
          title="albums"
          label="unique"
          value={stats.uniqueAlbums.toLocaleString()}
        />
        <Separator orientation="vertical" />
        <StatCard
          className="flex-1"
          title="tracks"
          label="total"
          value={stats.totalTracks.toLocaleString()}
        />
      </div>
    </section>
  );
}
