#!/usr/bin/env bun
/**
 * Resize and upload photos to R2 bucket.
 *
 * Usage:
 *   bun run scripts/upload-photos.ts [--dry-run] [--overwrite] /path/to/photos
 *
 * Expects flat files named YYYY-MM-DD.N.{jpg,jpeg,png,webp,heic,avif}:
 *   2026-05-04.1.jpg
 *   2026-05-04.2.jpg
 *
 * For each image, uploads:
 *   photography/2026-05-04.1.jpg        (original, full res, unchanged)
 *   photography/2026-05-04.1.smol.webp   (HD, 1280px wide)
 *
 * Skips files whose smol variant already exists in R2 unless --overwrite is set.
 *
 * Credentials sourced from:
 *   - Bucket info from `alchemy state get`
 *   - S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY env vars
 *
 *   Create an R2 API token via Cloudflare dashboard: R2 → Bucket → Manage → S3 API Tokens
 *   Then export S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY (or add to .env).
 */

import { $ } from "bun";

const HD_WIDTH = 1280;
const CONCURRENCY = 4;

const ext = (f: string) => f.slice(f.lastIndexOf("."));

const dryRun = process.argv.includes("--dry-run");
const overwrite = process.argv.includes("--overwrite");
const folder = process.argv.slice(2).find((a) => !a.startsWith("--"));

if (!folder) {
  console.error("Usage: bun run scripts/upload-photos.ts [--dry-run] [--overwrite] <folder>");
  process.exit(1);
}

const glob = new Bun.Glob("*.{jpg,jpeg,png,webp,heic,avif}");
const files: string[] = [];
for await (const file of glob.scan(folder)) {
  files.push(file);
}
files.sort();

if (files.length === 0) {
  console.error(`No supported images found in ${folder}`);
  process.exit(1);
}

console.log(`dry-run: ${dryRun}  overwrite: ${overwrite}  files: ${files.length}\n`);

let r2: Bun.S3Client | undefined;

if (!dryRun) {
  const stateResult =
    await $`bun alchemy state get --stack "elianiva-com" --stage "prod" --fqn "Photography"`.json();
  const { accountId, bucketName } = stateResult.attr;
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

  console.log(`bucket: ${bucketName}`);
  console.log(`endpoint: ${endpoint}\n`);

  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    console.error(
      "Missing R2 credentials. Set S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY env vars.\n" +
        "Create an API token at: Cloudflare Dashboard → R2 → Manage R2 API Tokens",
    );
    process.exit(1);
  }

  r2 = new Bun.S3Client({
    accessKeyId,
    secretAccessKey,
    endpoint,
    bucket: bucketName,
  });
}

async function processFile(file: string): Promise<"skip" | "ok"> {
  const e = ext(file);
  const base = file.slice(0, -e.length);
  const bunFile = Bun.file(`${folder}/${file}`);
  const sizeKb = (bunFile.size / 1024).toFixed(0);

  const dateKey = file.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    console.log(`SKIP  ${file}  (filename must start with YYYY-MM-DD)`);
    return "ok";
  }

  const origKey = `photography/${base}${e}`;
  const smolKey = `photography/${base}.smol.webp`;

  // Smol exists + no --overwrite → skip
  if (!dryRun && !overwrite) {
    const exists = await r2!.exists(smolKey);
    if (exists) {
      console.log(`[skip] ${file}`);
      return "skip";
    }
  }

  // Decode + resize + encode
  const img = new Bun.Image(bunFile);
  await img.buffer();
  const smolEnc = img.resize(HD_WIDTH).webp({ quality: 80 });
  const smolBytes = await smolEnc.buffer();
  const smolSizeKb = (smolBytes.length / 1024).toFixed(0);

  if (dryRun) {
    console.log(`[${sizeKb}KB] ${file} | [${sizeKb}KB] ${origKey} | [${smolSizeKb}KB] ${smolKey}`);
    return "ok";
  }

  // Original — upload as-is (no re-encode)
  await r2!.write(origKey, bunFile);

  // Smol — write already-encoded bytes
  await r2!.file(smolKey).write(smolBytes);

  console.log(`[${sizeKb}KB] ${file} | [${sizeKb}KB] ${origKey} | [${smolSizeKb}KB] ${smolKey}`);
  return "ok";
}

let uploaded = 0;
let skipped = 0;
const queue = [...files];

async function worker() {
  while (queue.length > 0) {
    const file = queue.shift()!;
    const result = await processFile(file);
    if (result === "skip") skipped++;
    else uploaded++;
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

if (dryRun) {
  console.log(`\nWould upload ${uploaded} photo(s).`);
} else {
  const parts = [`Uploaded ${uploaded}`];
  if (skipped > 0) parts.push(`skipped ${skipped}`);
  parts.push(`photo(s).`);
  console.log(`\n${parts.join(", ")}`);
}
