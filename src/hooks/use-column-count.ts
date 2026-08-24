import { useEffect, useState } from "react";

// Matches Tailwind breakpoints; 4 columns fits the 1080px container nicely.
const BREAKPOINTS: ReadonlyArray<readonly [query: string, columns: number]> = [
  ["(min-width: 1280px)", 4],
  ["(min-width: 1024px)", 3],
  ["(min-width: 640px)", 2],
];

/**
 * Number of masonry columns for the current viewport. Renders with
 * `serverColumns` during SSR (no hydration mismatch), then syncs to the real
 * viewport after mount.
 */
export function useColumnCount(serverColumns: number): number {
  const [columns, setColumns] = useState(serverColumns);

  useEffect(() => {
    const lists = BREAKPOINTS.map(([query]) => window.matchMedia(query));
    const update = () => {
      const index = lists.findIndex((list) => list.matches);
      setColumns(index === -1 ? 1 : BREAKPOINTS[index][1]);
    };
    update();
    for (const list of lists) list.addEventListener("change", update);
    return () => {
      for (const list of lists) list.removeEventListener("change", update);
    };
  }, []);

  return columns;
}
