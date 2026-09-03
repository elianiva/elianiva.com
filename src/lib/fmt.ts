import * as DateTime from "effect/DateTime";

export function fmtTokens(n = 0): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return n.toString();
}

export function fmtCost(n = 0): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}k`;
  return `$${n.toFixed(2)}`;
}

export function fmtRel(iso: string | null): string {
  if (!iso) return "now";
  const now = DateTime.nowUnsafe();
  const target = DateTime.makeUnsafe(iso);
  const diffMs = DateTime.toEpochMillis(now) - DateTime.toEpochMillis(target);
  const diff = diffMs / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86_400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2_592_000) return `${Math.floor(diff / 86_400)}d ago`;
  return iso.slice(0, 10);
}
