# CV

The CV is a [Typst](https://typst.app) document built from
[`@preview/basic-resume:0.2.9`](https://typst.app/universe/package/basic-resume/0.2.9).
It compiles to `public/assets/cv_dicha.pdf`, which is what the site's Download CV
link serves.

```
cv/
  main.typ    layout only: fonts, colours, and how the JSON maps to the template
  data.json   generated. Do not edit.
```

## The site is complete, the CV is curated

Both surfaces describe the same person, so the site holds the records and the CV
reads them. Nothing about the CV is written twice.

```
src/data/work-experience.ts   every role, with a `cv` flag
src/data/education.ts         every school
src/data/profile.ts           name, email, and links
src/types/technology.ts       every technology slug and its display name
src/content/projects/*.mdx    every project, with an optional `cv` block
        │
        │  pnpm gen:cv
        ▼
cv/data.json                  the curated subset, display-ready
        │
        │  typst compile
        ▼
public/assets/cv_dicha.pdf
```

`pnpm gen:cv` is the only step between them. It resolves lookups and formatting
— `legalName` to `company`, slugs to display names, `city` and `country` to a
place — so `main.typ` holds layout and nothing else.

## Build

```bash
pnpm gen:cv   # write cv/data.json from the site's data
pnpm cv       # generate, then compile the PDF
pnpm cv:watch # recompile whenever the data or main.typ changes
```

`pnpm build` runs `pnpm cv` first, so the PDF is never older than the data behind
it. `cv/data.json` is gitignored for the same reason.

Typst caches `@preview/basic-resume` after the first build, so later builds work
offline.

## Edit

Put content changes in `src/data` or `src/content/projects`, never in `data.json`.
A role is on the CV when its `cv` flag is true:

```ts
{ cv: true, company: "Aerotalon", ... }
{ cv: false, company: "Cubix Branding Agency", ... }
```

A project is on the CV when its frontmatter carries a `cv` block:

```yaml
cv:
  period: ["2026-06", null]
  details:
    - Markdown copy of every page plus an /llms.txt index, so LLMs can read the docs
```

CV roles keep the order they have in `work`. CV projects sort by when they
ended, most recent first. The site prints every role and every project either
way.

### Fields worth knowing

| Field          | Used by  | Notes                                                                                                                     |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `cv`           | CV only  | Whether the CV prints this record. The site prints everything.                                                            |
| `company`      | both     | Short brand, e.g. `IPB Training`.                                                                                         |
| `legalName`    | CV only  | Registered entity, e.g. `PT. Global Scholarship Services Indonesia`. The CV prints this when present.                     |
| `time`         | both     | `full-time`, `part-time`, `freelance`, or `contract`. The CV capitalises it and appends `, Remote` when `remote` is true. |
| `city`         | both     | Optional. Omit it where the role has no single city.                                                                      |
| `country`      | both     | The site shows a lower-case country badge; the CV joins it to `city`.                                                     |
| `period`       | both     | `["2026-01", null]`. A `null` end reads as `Present`.                                                                     |
| `technologies` | both     | Slugs from `src/types/technology.ts`. The site prints `#slug`, the CV prints the label.                                   |
| `stack`        | projects | `[name, url]` pairs. The site links each one; the CV prints the names.                                                    |
| `demo`         | projects | The CV links the demo when there is one, and the source otherwise.                                                        |

New technology slug: add it to `technologyLabels` in `src/types/technology.ts`.
The slug is then valid everywhere a role can name a technology, and the CV has
its display name, because there is only the one list.

### Keeping it to one page

The CV is one page, but only just. The site writes longer bullets than your old
CV did, so `main.typ` buys the room back two ways: the gap between entries goes
above each entry rather than below it, and the section headings use less block
spacing than Typst's 1.4em default. Drop either and education falls onto a
second page. If you add a role or a bullet, expect to trim `details` or repeat
one of those two trims.
