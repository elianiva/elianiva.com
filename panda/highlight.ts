/**
 * Token colours for TanStack Highlight (the `th-*` classes that
 * `app/lib/highlight.ts` emits), as a Panda `globalCss` fragment. Merge it
 * into `globalCss` in `panda.config.ts`.
 *
 * Generated with:
 *   node --input-type=module -e "import { createThemeCss } from '@tanstack/highlight/theme'; import { githubLightTheme } from '@tanstack/highlight/themes/github-light'; console.log(createThemeCss({ light: githubLightTheme }))"
 *
 * The block background stays transparent on purpose: the cream `pre`
 * treatment lives in `panda/prose.ts` with the rest of the prose styling.
 */
export const highlightStyles = {
  ":root": {
    "--th-token": "#24292f",
    "--th-attr": "#0550ae",
    "--th-code-inline": "#953800",
    "--th-command": "#8250df",
    "--th-comment": "#6e7781",
    "--th-deleted": "#cf222e",
    "--th-function": "#8250df",
    "--th-heading": "#0550ae",
    "--th-inserted": "#1a7f37",
    "--th-keyword": "#cf222e",
    "--th-link": "#0969da",
    "--th-literal": "#0550ae",
    "--th-meta": "#57606a",
    "--th-number": "#0550ae",
    "--th-operator": "#8250df",
    "--th-property": "#0550ae",
    "--th-selector": "#116329",
    "--th-string": "#0a7f64",
    "--th-tag": "#116329",
    "--th-type": "#953800",
    "--th-variable": "#953800",
  },
  "pre.th-code": { overflowX: "auto", color: "var(--th-token)" },
  ".th-token": { color: "var(--th-token)" },
  ".th-attr": { color: "var(--th-attr)" },
  ".th-code-inline": { color: "var(--th-code-inline)" },
  ".th-command": { color: "var(--th-command)" },
  ".th-comment": { color: "var(--th-comment)" },
  ".th-deleted": { color: "var(--th-deleted)" },
  ".th-function": { color: "var(--th-function)" },
  ".th-heading": { color: "var(--th-heading)" },
  ".th-inserted": { color: "var(--th-inserted)" },
  ".th-keyword": { color: "var(--th-keyword)" },
  ".th-link": { color: "var(--th-link)" },
  ".th-literal": { color: "var(--th-literal)" },
  ".th-meta": { color: "var(--th-meta)" },
  ".th-number": { color: "var(--th-number)" },
  ".th-operator": { color: "var(--th-operator)" },
  ".th-property": { color: "var(--th-property)" },
  ".th-selector": { color: "var(--th-selector)" },
  ".th-string": { color: "var(--th-string)" },
  ".th-tag": { color: "var(--th-tag)" },
  ".th-type": { color: "var(--th-type)" },
  ".th-variable": { color: "var(--th-variable)" },
  ".th-line": { display: "inline-block", minWidth: "100%", width: "max-content" },
  ".th-code--line-numbers code": { counterReset: "th-line" },
  ".th-code--line-numbers .th-line::before": {
    display: "inline-block",
    width: "2.5em",
    paddingRight: "1em",
    color: "var(--th-comment)",
    content: "attr(data-line)",
    textAlign: "right",
    userSelect: "none",
  },
} as const;
