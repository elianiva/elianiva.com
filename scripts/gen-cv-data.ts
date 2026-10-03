/**
 * Builds `cv/data.json` from the site's own data.
 *
 * The CV is the smaller, curated view of the same records the site renders, so
 * the JSON is generated rather than maintained. Nothing here decides what the
 * CV prints: each entry carries a `cv` flag, and the generator only resolves
 * lookups and formatting so `cv/main.typ` can stay layout-only.
 *
 *   pnpm gen:cv
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import yaml from "yaml";

import { education } from "~/data/education";
import { bareHost, profile } from "~/data/profile";
import { engagement, place, work } from "~/data/work-experience";
import { technologyLabel } from "~/types/technology";

const root = fileURLToPath(new URL("..", import.meta.url));
const projectsDir = path.join(root, "src/content/projects");
const outFile = path.join(root, "cv/data.json");

/** What `cv/main.typ` reads. Every field here is already display-ready. */
function buildCvData() {
  return {
    profile: {
      name: profile.name,
      location: profile.location,
      email: profile.cvEmail,
      github: bareHost(profile.urls.github),
      linkedin: bareHost(profile.urls.linkedin),
      personalSite: bareHost(profile.urls.personalSite),
    },
    work: work
      .filter((entry) => entry.cv)
      .map((entry) => ({
        company: entry.legalName ?? entry.company,
        position: entry.position,
        engagement: engagement(entry),
        location: place(entry),
        period: entry.period,
        details: entry.details,
        stack: entry.technologies.map(technologyLabel),
      })),
    projects: cvProjects(),
    education: education.map((school) => ({
      institution: school.institution,
      location: school.location,
      degree: school.degree,
      period: school.period,
      details: school.details,
    })),
  };
}

export function writeCvData() {
  const cv = buildCvData();
  writeFileSync(outFile, `${JSON.stringify(cv, null, 2)}\n`);
  return cv;
}

// Run as a script (`pnpm gen:cv`), not when `scripts/cv-watch.ts` imports it.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cv = writeCvData();
  const summary = `${cv.work.length} roles, ${cv.projects.length} projects`;
  console.log(`wrote ${path.relative(root, outFile)}: ${summary}`);
}

/**
 * Projects come from the content collection, so a project is described once.
 * Frontmatter is the boundary, so it is parsed and checked here rather than
 * trusted.
 */
function cvProjects() {
  const entries = readdirSync(projectsDir)
    .filter((name) => name.endsWith(".mdx"))
    .flatMap((name) => {
      const front = frontmatter(path.join(projectsDir, name));
      const cv = record(front.cv, `${name} cv`);
      if (!cv) return [];

      const period = periodOf(cv.period, `${name} cv.period`);
      return [
        {
          name: text(front.title, `${name} title`),
          // A recruiter clicks one link, so prefer the live demo over the repo.
          url: bareHost(text(front.demo ?? front.source, `${name} source`)),
          period,
          details: strings(cv.details, `${name} cv.details`),
          stack: stackNames(front.stack, `${name} stack`),
          sortKey: period[1] ?? period[0],
        },
      ];
    });

  // Most recent first, by when the project ended. A current project sorts on
  // its start, which is the closest date it has.
  return entries
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
    .map(({ sortKey: _sortKey, ...entry }) => entry);
}

function frontmatter(file: string): Record<string, unknown> {
  const name = path.basename(file);
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, "utf8"));
  if (!match) throw new Error(`${name} has no frontmatter`);
  const parsed = yaml.parse(match[1]);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new TypeError(`${name} frontmatter must be a mapping`);
  }
  return parsed as Record<string, unknown>;
}

function text(value: unknown, where: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${where} must be a non-empty string`);
  }
  return value;
}

function strings(value: unknown, where: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new TypeError(`${where} must be a list of strings`);
  }
  return value as string[];
}

/** Absent is how a project says it stays off the CV. */
function record(value: unknown, where: string): Record<string, unknown> | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${where} must be a mapping`);
  }
  return value as Record<string, unknown>;
}

function stackNames(value: unknown, where: string): string[] {
  if (!Array.isArray(value) || value.some((pair) => !Array.isArray(pair) || pair.length !== 2)) {
    throw new TypeError(`${where} must be a list of [name, url] pairs`);
  }
  return (value as string[][]).map(([name]) => text(name, where));
}

/** `["2025-05", "2025-12"]`, where a null end means the project is current. */
function periodOf(value: unknown, where: string): [string, string | null] {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new TypeError(`${where} must be a [start, end] pair`);
  }
  const [start, end] = value as unknown[];
  const month = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (typeof start !== "string" || !month.test(start)) {
    throw new TypeError(`${where} start must look like YYYY-MM, got ${JSON.stringify(start)}`);
  }
  if (end !== null && (typeof end !== "string" || !month.test(end))) {
    throw new TypeError(
      `${where} end must look like YYYY-MM or be null, got ${JSON.stringify(end)}`,
    );
  }
  return [start, end as string | null];
}
