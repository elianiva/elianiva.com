/**
 * Greedy shortest-column placement — the same strategy Pinterest's Gestalt
 * Masonry and the W3C css-grid-3 masonry explainer describe: track a running
 * height per column, and place each item (in order) into the left-most
 * shortest column.
 *
 * Unlike CSS multi-columns, order flows left-to-right across the top before
 * descending, so chronological ordering survives. Runs in O(n · k).
 */
export function distributeMasonry<T>(
  items: readonly T[],
  columnCount: number,
  getRelativeHeight: (item: T) => number,
): T[][] {
  const columns: T[][] = Array.from({ length: Math.max(columnCount, 1) }, () => []);
  const heights = Array.from<number>({ length: columns.length }).fill(0);

  for (const item of items) {
    let target = 0;
    for (let i = 1; i < columns.length; i++) {
      if (heights[i] < heights[target]) target = i;
    }
    columns[target].push(item);
    heights[target] += getRelativeHeight(item);
  }

  return columns;
}

/** "w/h" aspect ratio string (e.g. "2/3") → relative height h/w (e.g. 1.5). */
export function aspectRatioToRelativeHeight(aspectRatio: string): number {
  const [w, h] = aspectRatio.split("/").map(Number);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0) return 1;
  return h / w;
}
