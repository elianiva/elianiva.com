import { describe, expect, it } from "vite-plus/test";
import { fitTitleSize, formatDate, toOgContent, truncate } from "./og-content";

describe("fitTitleSize", () => {
  it("gives a short title the full size", () => {
    expect(fitTitleSize("My experience with Svelte")).toBe(68);
  });

  it("steps down as the title gets longer", () => {
    const short = fitTitleSize("a".repeat(40));
    const long = fitTitleSize("a".repeat(70));
    expect(long).toBeLessThan(short);
  });

  it("never goes below the floor, however long the title", () => {
    expect(fitTitleSize("a".repeat(120))).toBe(30);
  });
});

describe("formatDate", () => {
  it("writes the date the way the site does, without the weekday", () => {
    expect(formatDate("2024-03-15")).toBe("15 March 2024");
  });
});

describe("truncate", () => {
  it("leaves short text alone", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("adds an ellipsis and trims the trailing space", () => {
    expect(truncate("hello world", 8)).toBe("hello w…");
  });
});

describe("toOgContent", () => {
  const spec = {
    type: "post" as const,
    title: "A post",
    date: "2024-03-15",
    tags: ["svelte", "frontend"],
    description: "A description.",
  };

  it("marks a post and formats its date", () => {
    const content = toOgContent(spec);
    expect(content.kind).toBe("post");
    expect(content.date).toBe("15 March 2024");
  });

  it("marks a non-post as a page and leaves the date empty", () => {
    const content = toOgContent({ type: "default", title: "Teknum" });
    expect(content.kind).toBe("page");
    expect(content.date).toBe("");
    expect(content.tags).toEqual([]);
  });

  it("keeps an empty description and tag list as empty", () => {
    const content = toOgContent({ ...spec, description: "", tags: [] });
    expect(content.description).toBe("");
    expect(content.tags).toEqual([]);
  });

  it("caps the description and tag list to what fits the card", () => {
    const content = toOgContent({
      ...spec,
      description: "a".repeat(200),
      tags: ["a", "b", "c", "d", "e", "f"],
    });
    expect(content.description.length).toBeLessThanOrEqual(120);
    expect(content.tags).toHaveLength(4);
  });
});
