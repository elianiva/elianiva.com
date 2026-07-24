#!/usr/bin/env bun
/**
 * Upload photos to R2 bucket.
 * Usage: bun run scripts/upload-photos.ts ./path/to/date-folder
 *
 * Expects folder structure:
 *   ./photography/2025-03-15/img-001.webp
 *
 * Resizes images to HD width (1280px) and uploads both HD + original.
 * Requires R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY env vars (when R2 is set up).
 */

// TODO: implement when R2 bucket is provisioned (see docs/alchemy-migration.md)

const folder = process.argv[2];
if (!folder) {
  console.error("Usage: bun run scripts/upload-photos.ts <folder>");
  process.exit(1);
}

console.log(`Uploading photos from: ${folder}`);
console.log("Script scaffolding — R2 not yet provisioned.");
