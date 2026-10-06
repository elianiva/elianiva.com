// Emits robots.txt, rss.xml, and the OG images into `dist/client` after
// `vp build` (Start owns the HTML + sitemap.xml). Runs under tsx, so the
// `~/*` path alias from package.json `imports` resolves like it does for
// the app source.
import path from "node:path";
import { emitStaticAssets } from "./static-assets";

const root = process.cwd();
const outDir = path.join(root, "dist", "client");

await emitStaticAssets(root, outDir);
console.log(`static assets written to ${outDir}`);
