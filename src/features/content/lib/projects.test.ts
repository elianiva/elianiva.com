import { describe, expect, it } from "vite-plus/test";
import { listProjects, getProject, type ProjectDoc } from "./projects";
import type { MDXContent } from "mdx/types";

const mdx = (() => null) as unknown as MDXContent;

function makeProject(overrides: Partial<ProjectDoc> = {}): ProjectDoc {
  return {
    slug: "test-project",
    title: "Test",
    description: "desc",
    date: "2024-06-01",
    featured: false,
    type: "personal",
    source: "https://github.com/test/test",
    demo: null,
    stack: [["React", "https://react.dev"]] as string[][],
    mdx,
    ...overrides,
  };
}

const projects: ProjectDoc[] = [
  makeProject({ slug: "b", date: "2024-01-15", type: "personal", featured: false }),
  makeProject({ slug: "a", date: "2024-06-01", type: "personal", featured: true }),
  makeProject({ slug: "c", date: "2023-12-01", type: "open-source", featured: true }),
];

describe("listProjects", () => {
  it("returns all projects when no filter, newest first", () => {
    const result = listProjects(projects);
    expect(result).toHaveLength(3);
    expect(result[0].slug).toBe("a");
    expect(result[1].slug).toBe("b");
    expect(result[2].slug).toBe("c");
  });

  it("filters by type", () => {
    const result = listProjects(projects, { type: "open-source" });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("c");
  });

  it("filters by featured", () => {
    const result = listProjects(projects, { featured: true });
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.featured)).toBe(true);
  });

  it("combines type + featured filters", () => {
    const result = listProjects(projects, { type: "personal", featured: true });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("a");
  });

  it("does not mutate the input array", () => {
    const clone = [...projects];
    listProjects(projects);
    expect(projects).toEqual(clone);
  });
});

describe("getProject", () => {
  it("returns null for unknown slug", () => {
    expect(getProject(projects, "nonexistent")).toBeNull();
  });

  it("returns project detail with source and demo", () => {
    const detail = getProject(projects, "a");
    expect(detail).not.toBeNull();
    expect(detail!.project.slug).toBe("a");
    expect(detail!.project.source).toBe("https://github.com/test/test");
    expect(detail!.project.demo).toBeNull();
    expect(detail!.project.featured).toBe(true);
  });

  it("returns prev/next neighbours", () => {
    const detail = getProject(projects, "b");
    expect(detail!.prevProject?.slug).toBe("c");
    expect(detail!.nextProject?.slug).toBe("a");
  });

  it("does not mutate input array", () => {
    const clone = [...projects];
    getProject(projects, "a");
    expect(projects).toEqual(clone);
  });
});
