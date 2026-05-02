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

export function ClientsSection({ clientTotals, contributionsLength, totalCost }: Props) {
  return (
    <section className="py-4 md:py-8">
      <div>
        <Heading level={2} right={`used in the past ${contributionsLength} days`}>
          clients
        </Heading>
      </div>
      <div>
        {clientTotals.length === 0 ? (
          <p className="text-sm font-body text-pink-950/60">No client data available.</p>
        ) : (
          <table className="w-full border-collapse font-mono text-sm">
            <thead>
              <tr>
                {["client", "cost", "tokens", "share"].map((label) => (
                  <th
                    key={label}
                    className="text-left py-2 text-[10px] text-pink-950/40 uppercase tracking-widest font-normal border-b border-pink-200"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientTotals.map((c) => (
                <tr key={c.client}>
                  <td className="py-2 text-pink-500">{c.client}</td>
                  <td className="py-2 text-pink-800">{fmtCost(c.cost)}</td>
                  <td className="py-2 text-pink-950/60">{fmtTokens(c.tokens)}</td>
                  <td className="py-2 text-pink-950/40">
                    {((c.cost / totalCost) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}