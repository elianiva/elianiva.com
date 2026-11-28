import { createHighlighter } from "@tanstack/highlight/core";
import { css } from "@tanstack/highlight/languages/css";
import { diff } from "@tanstack/highlight/languages/diff";
import { html } from "@tanstack/highlight/languages/html";
import { js } from "@tanstack/highlight/languages/js";
import { json } from "@tanstack/highlight/languages/json";
import { jsx } from "@tanstack/highlight/languages/jsx";
import { markdown } from "@tanstack/highlight/languages/markdown";
import { plaintext } from "@tanstack/highlight/languages/plaintext";
import { python } from "@tanstack/highlight/languages/python";
import { shell } from "@tanstack/highlight/languages/shell";
import { sql } from "@tanstack/highlight/languages/sql";
import { svelte } from "@tanstack/highlight/languages/svelte";
import { toml } from "@tanstack/highlight/languages/toml";
import { ts } from "@tanstack/highlight/languages/ts";
import { tsx } from "@tanstack/highlight/languages/tsx";
import { yaml } from "@tanstack/highlight/languages/yaml";

/**
 * The site's syntax highlighter: TanStack Highlight, synchronous and
 * selective — only the languages used in `app/content` are registered.
 *
 * Fences in any other language (vim, lua, nix, csharp, tex, ini, c, …)
 * degrade to escaped plain text via the `plaintext` fallback. That is
 * intentional: the previous Shiki setup shipped a full grammar runtime
 * for marginal gains on config-file snippets.
 *
 * Used two ways, both with this same instance:
 * - render: `app/ui/markdown.ts` highlights each code fence while the page
 *   renders (on the server for the prerender, and again when the browser
 *   renders), into `th-*` class markup.
 * - theme: `panda/highlight.ts` holds the token colours, generated from the
 *   same package's `createThemeCss({ light: githubLightTheme })`.
 */
export const highlighter = createHighlighter({
  languages: [
    plaintext,
    shell, // aliases: bash, sh, zsh
    js, // aliases: javascript, mjs, cjs
    ts, // aliases: typescript
    tsx,
    jsx,
    html, // aliases: xml
    css,
    json, // aliases: jsonc, json5
    yaml, // aliases: yml
    toml,
    sql,
    diff, // aliases: patch
    markdown, // aliases: md
    python, // aliases: py
    svelte,
  ],
});
