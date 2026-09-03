export function byDateDesc<T extends { date: string }>(a: T, b: T): number {
  return b.date.localeCompare(a.date);
}

export function toNeighbour<T extends { slug: string; title: string }>(
  doc: T | undefined,
): { slug: string; title: string } | null {
  return doc ? { slug: doc.slug, title: doc.title } : null;
}
