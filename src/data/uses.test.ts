import { describe, expect, it } from "vite-plus/test";
import { uses, usesUpdatedAt } from "./uses";

describe("uses", () => {
  it("has at least three sections with unique slugs", () => {
    expect(uses.length).toBeGreaterThanOrEqual(3);
    const slugs = uses.map((section) => section.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("records when the list was last updated", () => {
    expect(usesUpdatedAt).toBe("2026-09-09");
  });

  it("gives every section at least one item with name, spec, and note", () => {
    for (const section of uses) {
      expect(section.items.length).toBeGreaterThanOrEqual(1);
      for (const item of section.items) {
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.spec.length).toBeGreaterThan(0);
        expect(item.note.length).toBeGreaterThan(0);
      }
    }
  });
});
