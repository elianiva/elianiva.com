function kvKey(key: string): string {
  return `cache:${key}`;
}

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const ns = await import("cloudflare:workers")
    .then((m) => (m.env as { CACHE?: KVNamespace }).CACHE)
    .catch(() => undefined);

  if (ns) {
    try {
      const raw = await ns.get(kvKey(key));
      if (raw) {
        const entry = JSON.parse(raw) as { value: T; at: number };
        if (Date.now() - entry.at < ttlMs) return entry.value;
        ns.delete(kvKey(key)).catch(() => {});
      }
    } catch {
      // fall through to load
    }
  }

  const value = await load();
  if (ns) {
    const ttlSec = Math.max(Math.ceil(ttlMs / 1000), 60);
    ns.put(kvKey(key), JSON.stringify({ value, at: Date.now() }), {
      expirationTtl: Math.min(ttlSec, 604_800),
    }).catch(() => {});
  }
  return value;
}

export const TTL = {
  live: 1000 * 20, // 20s — music, live data
  short: 1000 * 60 * 5, // 5m
  medium: 1000 * 60 * 30, // 30m
  long: 1000 * 60 * 60 * 6, // 6h — GitHub PRs, contributions
};
