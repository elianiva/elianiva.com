type Entry<T> = { value: T; at: number };

const store = new Map<string, Entry<unknown>>();

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && Date.now() - hit.at < ttlMs) return hit.value;
  try {
    const value = await load();
    store.set(key, { value, at: Date.now() });
    return value;
  } catch (err) {
    if (hit) return hit.value;
    throw err;
  }
}

export const TTL = {
  live: 1000 * 20, // 20s
  short: 1000 * 60 * 5, // 5m
  medium: 1000 * 60 * 30, // 30m
  long: 1000 * 60 * 60 * 6, // 6h
};
