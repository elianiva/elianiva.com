import { createServerFn } from "@tanstack/react-start";
import { allProjects } from "content-collections";

/**
 * When each project's GitHub repo last got a push, by slug. The projects page
 * loads this at build time (the deploy runs daily), so the order follows my
 * commit activity without a request from the browser. Projects off GitHub, or
 * any lookup that fails, are left out and fall back to their frontmatter date.
 */
export const fetchProjectActivity = createServerFn().handler(async () => {
  const token = process.env.GH_TOKEN ?? "";
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const entries = await Promise.all(
    allProjects.map(async (project) => {
      const repo = project.source.match(/github\.com\/([^/]+\/[^/#?]+)/)?.[1];
      if (!repo) return null;
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
        if (!res.ok) return null;
        const { pushed_at } = (await res.json()) as { pushed_at?: string };
        return pushed_at ? ([project.slug, pushed_at] as const) : null;
      } catch {
        return null;
      }
    }),
  );
  return Object.fromEntries(entries.filter((e) => e !== null)) as Record<string, string>;
});
