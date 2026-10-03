/**
 * Recompiles the CV when the data behind it changes.
 *
 *   pnpm cv:watch
 *
 * Watches the sources, not `cv/data.json`, so writing the generated file does
 * not trigger another build. Typst reads the JSON on each compile, so a change
 * to a role, a project, or `main.typ` lands in the PDF.
 */
import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { writeCvData } from "./gen-cv-data";

const root = fileURLToPath(new URL("..", import.meta.url));
const pdf = path.join(root, "public/assets/cv_dicha.pdf");

const WATCHED = ["src/data", "src/types", "src/content/projects", "cv/main.typ"];

let queued: NodeJS.Timeout | undefined;

function build() {
  const cv = writeCvData();
  console.log(`data.json: ${cv.work.length} roles, ${cv.projects.length} projects`);
  compile();
}

// `@preview/basic-resume` warns about its own raw blocks on every run, so
// stderr is only worth showing when it names this document or reports an error.
function compile() {
  const typst = spawn("typst", ["compile", "cv/main.typ", pdf], {
    cwd: root,
    stdio: ["ignore", "ignore", "pipe"],
  });
  let stderr = "";
  typst.stderr.on("data", (chunk: Buffer) => {
    stderr += chunk;
  });
  typst.on("close", (code) => {
    const fromThisDocument = stderr
      .split("\n")
      .some((line) => line.includes("cv/main.typ") || line.startsWith("error"));
    if (code !== 0 || fromThisDocument) process.stderr.write(stderr);
    console.log(code === 0 ? "pdf: ok" : `pdf: typst exited ${code}`);
  });
}

// Editors write a file several times in a row. One rebuild per burst.
function schedule() {
  clearTimeout(queued);
  queued = setTimeout(build, 120);
}

build();

for (const target of WATCHED) {
  watch(path.join(root, target), { recursive: true }, schedule);
}

console.log(`watching ${WATCHED.join(", ")}`);
