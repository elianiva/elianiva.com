import { Heading } from "~/components/ui/heading";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "~/components/ui/table";
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
          <Table className="font-mono text-sm">
            <TableHeader>
              <TableRow>
                {["client", "cost", "tokens", "share"].map((label) => (
                  <TableHead
                    key={label}
                    className="text-[10px] text-pink-950/40 uppercase tracking-widest font-normal"
                  >
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientTotals.map((c) => (
                <TableRow key={c.client}>
                  <TableCell className="text-pink-500">{c.client}</TableCell>
                  <TableCell className="text-pink-800">{fmtCost(c.cost)}</TableCell>
                  <TableCell className="text-pink-950/60">{fmtTokens(c.tokens)}</TableCell>
                  <TableCell className="text-pink-950/40">
                    {((c.cost / totalCost) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}

