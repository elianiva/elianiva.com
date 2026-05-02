import { Heading } from "~/components/ui/heading";
import { fmtTokens, fmtCost } from "./fmt";

interface ClientTotal {
  client: string;
  cost: number;
  tokens: number;
}

interface Props {
  clientTotals: ClientTotal[];
  contributionsLength: number;
  totalCost: number;
}

export function AiClientsSection({ clientTotals, contributionsLength, totalCost }: Props) {
  return (
    <section className="py-4 md:py-8">
      <div>
        <Heading level={2} right={`${clientTotals.length} clients`}>
          Clients
        </Heading>
      </div>
      <div>
        {clientTotals.length === 0 ? (
          <p className="text-sm font-body text-pink-950/60">No client data available.</p>
        ) : (
          <div className="space-y-1 font-mono text-xs">
            {clientTotals.map((c) => (
              <div key={c.client} className="flex items-center gap-3 p-2 bg-white/60 border border-pink-200/50">
                <span className="flex-1 text-pink-800 capitalize">{c.client}</span>
                <span className="text-pink-950/70">{fmtTokens(c.tokens)}</span>
                <span className="text-pink-950/70 w-16 text-right">{fmtCost(c.cost)}</span>
                <span className="text-pink-950/40 w-12 text-right">
                  {totalCost > 0 ? ((c.cost / totalCost) * 100).toFixed(1) : "0"}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}