import { describe, expect, it } from "vite-plus/test";
import { formatCount, formatUtcDate, type DateParts } from "./date";

const shapes: DateParts[] = [
  { day: "2-digit", month: "short" },
  { day: "numeric", month: "short", year: true },
  { day: "numeric", month: "long", year: true },
  { month: "short", year: true },
];

describe("formatUtcDate", () => {
  it("matches Intl for every day of several years", () => {
    for (const parts of shapes) {
      const intl = new Intl.DateTimeFormat("en-GB", {
        day: parts.day,
        month: parts.month,
        year: parts.year ? "numeric" : undefined,
        timeZone: "UTC",
      });
      for (let day = Date.UTC(2019, 0, 1); day < Date.UTC(2028, 0, 1); day += 86_400_000) {
        expect(formatUtcDate(day, parts)).toBe(intl.format(day));
      }
    }
  });
});

describe("formatCount", () => {
  it("matches toLocaleString for whole numbers", () => {
    for (const n of [0, 7, 999, 1000, 12_345, 999_999, 1_234_567, 2_000_000_000]) {
      expect(formatCount(n)).toBe(n.toLocaleString("en-GB"));
    }
  });
});
