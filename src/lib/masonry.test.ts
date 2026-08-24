import { expect, it } from "vite-plus/test";
import { aspectRatioToRelativeHeight, distributeMasonry } from "./masonry";

it("round-robins equal-height items across columns", () => {
  const result = distributeMasonry([1, 2, 3, 4, 5, 6], 3, () => 1);
  expect(result).toEqual([
    [1, 4],
    [2, 5],
    [3, 6],
  ]);
});

it("places items into the left-most shortest column", () => {
  // item 1 is tall, so item 2 skips column 0 and lands in column 1
  const result = distributeMasonry([1, 2, 3], 2, (n) => (n === 1 ? 10 : 1));
  expect(result).toEqual([[1], [2, 3]]);
});

it("keeps every item exactly once", () => {
  const items = Array.from({ length: 47 }, (_, i) => i);
  const flat = distributeMasonry(items, 4, () => Math.random()).flat();
  expect([...flat].sort((a, b) => a - b)).toEqual(items);
});

it("handles a single column and empty input", () => {
  expect(distributeMasonry([1, 2], 1, () => 1)).toEqual([[1, 2]]);
  expect(distributeMasonry([], 4, () => 1)).toEqual([[], [], [], []]);
});

it("never clumps into one column for balanced input", () => {
  // the classic masonry failure mode: all portrait photos should spread out
  const result = distributeMasonry(
    Array.from({ length: 12 }, () => 1.5),
    4,
    (h) => h,
  );
  expect(result.map((column) => column.length)).toEqual([3, 3, 3, 3]);
});

it("converts aspect ratio strings to relative heights", () => {
  expect(aspectRatioToRelativeHeight("2/3")).toBe(1.5);
  expect(aspectRatioToRelativeHeight("3/2")).toBeCloseTo(0.667);
});
