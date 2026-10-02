import { describe, expect, it } from "vite-plus/test";
import { uses, usesUpdatedAt } from "./uses";

describe("uses", () => {
  it("has at least three sections with unique slugs", () => {
    expect(uses.length).toBeGreaterThanOrEqual(3);
    const slugs = uses.map((section) => section.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("records when the list was last updated as an ISO date", () => {
    expect(usesUpdatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(usesUpdatedAt))).toBe(false);
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

  it("has unique item names within each section", () => {
    for (const section of uses) {
      const names = section.items.map((item) => item.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it("explains at least one item per section, since the page exists to answer 'why'", () => {
    for (const section of uses) {
      expect(section.items.some((item) => item.why)).toBe(true);
    }
  });

  it("never leaves swapFor without why to hang it on", () => {
    for (const section of uses) {
      for (const item of section.items) {
        if (item.swapFor) expect(item.why).toBeTruthy();
      }
    }
  });

  it("keeps prose fields plain text, since nothing renders Markdown here", () => {
    for (const section of uses) {
      for (const item of section.items) {
        for (const field of [item.note, item.why, item.swapFor]) {
          if (!field) continue;
          expect(field).not.toMatch(/\[.+\]\(.+\)/);
          expect(field).not.toMatch(/[*_`]/);
        }
      }
    }
  });
});
