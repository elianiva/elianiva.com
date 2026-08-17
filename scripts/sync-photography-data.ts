#!/usr/bin/env bun
/**
 * Sync photos from R2 bucket into src/data/photography.ts.
 *
 * Usage:
 *   bun run scripts/sync-photography-data.ts [--dry-run]
 *
 * Scans all objects under photography/ prefix in R2, groups by base name,
 * merges with existing entries:
 *
 *   - If an entry with the same URL already exists, keep it as-is.
 *   - If not, add a new entry with id, dateTaken, url filled; aspectRatio
 *     decoded from the smol variant. Camera, lens, editedWith left undefined.
 *
 * Credentials sourced from:
 *   - Bucket info from `alchemy state get`
 *   - S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY env vars
 */

import { $ } from "bun";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PhotoEntry } from "../src/data/photography";

const DATA_FILE = join(import.meta.dirname, "..", "src", "data", "photography.ts");
const dryRun = process.argv.includes("--dry-run");

// ── R2 client setup ──────────────────────────────────────────────

const stateResult =
  await $`bun alchemy state get --stack "elianiva-com" --stage "prod" --fqn "Photography"`.json();
const { accountId, bucketName } = stateResult.attr;
const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
if (!accessKeyId || !secretAccessKey) {
  console.error(
    "Missing R2 credentials. Set S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY env vars.\n" +
      "Create an API token at: Cloudflare Dashboard → R2 → Manage R2 API Tokens",
  );
  process.exit(1);
}

const r2 = new Bun.S3Client({ accessKeyId, secretAccessKey, endpoint, bucket: bucketName });

// ── List all objects under photography/ ──────────────────────────

async function listAllObjects(): Promise<string[]> {
  const keys: string[] = [];
  let startAfter: string | undefined;

  for (;;) {
    const page = await r2.list({ prefix: "photography/", maxKeys: 1000, startAfter });
    if (!page.contents) break;
    for (const obj of page.contents) keys.push(obj.key);
    if (!page.isTruncated) break;
    startAfter = keys.at(-1);
  }

  return keys;
}

// ── Group keys by photo base name ────────────────────────────────

const SMOL_RE = /^photography\/(.+)\.smol\.webp$/;

interface ScannedPhoto {
  base: string;
  dateTaken: string;
  url: string; // smol variant key
}

function groupPhotos(keys: string[]): ScannedPhoto[] {
  const map = new Map<string, ScannedPhoto>();

  for (const key of keys) {
    const m = key.match(SMOL_RE);
    if (!m) continue;
    const base = m[1];
    const dateTaken = base.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateTaken)) continue;
    if (!map.has(base)) {
      map.set(base, { base, dateTaken, url: key });
    }
  }

  return [...map.values()];
}

// ── Aspect ratio detection ──────────────────────────────────────

async function resolveAspectRatio(smolKey: string): Promise<PhotoEntry["aspectRatio"]> {
  const bytes = await r2.file(smolKey).arrayBuffer();
  const img = new Bun.Image(bytes);
  await img.buffer();
  return img.width >= img.height ? "3/2" : "2/3";
}

// ── Id generation ────────────────────────────────────────────────

function toId(base: string): string {
  return `photo-${base.replace(".", "-")}`;
}

// ── Serialize helpers ────────────────────────────────────────────

const ARRAY_OPEN = "export const photos: PhotoEntry[] = [";
const ARRAY_CLOSE = "];";

function entryToSource(e: PhotoEntry, indent: string): string {
  const lines: string[] = [];
  lines.push(`${indent}{`);
  lines.push(`${indent}  id: ${JSON.stringify(e.id)},`);
  lines.push(`${indent}  dateTaken: ${JSON.stringify(e.dateTaken)},`);
  lines.push(`${indent}  url: ${JSON.stringify(e.url)},`);
  if (e.camera) lines.push(`${indent}  camera: ${JSON.stringify(e.camera)},`);
  if (e.lensOrSensor) lines.push(`${indent}  lens: ${JSON.stringify(e.lensOrSensor)},`);
  if (e.editedWith) lines.push(`${indent}  editedWith: ${JSON.stringify(e.editedWith)},`);
  lines.push(`${indent}},`);
  return lines.join("\n");
}

function rebuildSource(prefix: string, entries: PhotoEntry[], suffix: string): string {
  const body = entries.map((e) => entryToSource(e, "  ")).join("\n");
  return `${prefix}${ARRAY_OPEN}\n${body}\n${ARRAY_CLOSE}${suffix}`;
}

// ── Main ─────────────────────────────────────────────────────────

// 1. Read current data file
const currentContent = readFileSync(DATA_FILE, "utf-8");
const arrStart = currentContent.indexOf(ARRAY_OPEN);
if (arrStart === -1) throw new Error("Could not find photos array opening");

const prefix = currentContent.slice(0, arrStart);
const afterOpen = currentContent.slice(arrStart + ARRAY_OPEN.length);

let depth = 0;
let arrBodyEnd = -1;
for (let i = 0; i < afterOpen.length; i++) {
  if (afterOpen[i] === "[") depth++;
  else if (afterOpen[i] === "]") {
    if (depth === 0) {
      arrBodyEnd = i;
      break;
    }
    depth--;
  }
}
if (arrBodyEnd === -1) throw new Error("Could not find photos array closing");

const suffix = afterOpen.slice(arrBodyEnd + 1);

// 2. Try to load existing photos via dynamic import
let existing: PhotoEntry[] = [];
try {
  const mod = await import(join(import.meta.dirname, "..", "src", "data", "photography.ts"));
  existing = mod.photos;
  console.log(`Read ${existing.length} existing entries from data file`);
} catch (err) {
  console.warn("Could not import existing data (maybe first run):", err);
}

// 3. Scan R2
const allKeys = await listAllObjects();
console.log(`Found ${allKeys.length} objects under photography/`);

const scanned = groupPhotos(allKeys);
console.log(`Grouped into ${scanned.length} unique photos\n`);

// 4. Merge
const existingByUrl = new Map(existing.map((p) => [p.url, p]));
const merged: PhotoEntry[] = [...existing];
let added = 0;
let kept = 0;
let skipped = 0;

for (const photo of scanned) {
  if (existingByUrl.has(photo.url)) {
    kept++;
    continue;
  }

  let aspectRatio: PhotoEntry["aspectRatio"];
  try {
    aspectRatio = await resolveAspectRatio(photo.url);
  } catch (err) {
    console.warn(`  [skip] ${photo.base}: could not decode smol variant (${String(err)})`);
    skipped++;
    continue;
  }

  merged.push({
    id: toId(photo.base),
    dateTaken: photo.dateTaken,
    url: photo.url,
    aspectRatio,
  });
  console.log(`  [add] ${photo.base} (${aspectRatio})  -> ${toId(photo.base)}`);
  added++;
}

// 5. Sort: newest first, then by id
merged.sort((a, b) => b.dateTaken.localeCompare(a.dateTaken) || a.id.localeCompare(b.id));

// 6. Write
const newContent = rebuildSource(prefix, merged, suffix);

if (dryRun) {
  console.log(`\n[dry-run] Would add ${added}, keep ${kept}, skip ${skipped}. File unchanged.`);
} else {
  writeFileSync(DATA_FILE, newContent, "utf-8");
  console.log(`\nAdded ${added}, kept ${kept}, skipped ${skipped} photo(s). Updated ${DATA_FILE}`);
}
