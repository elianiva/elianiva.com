---
title: KitBuild
date: 2026-03-01
description: A from-scratch reimplementation of the Kit-Build Concept Map platform, built for my bachelor thesis.
demo: https://kb.elianiva.com
source: https://github.com/elianiva/kitbuild-cf
type: personal
featured: true
stack:
  - ["TanStack Start", "https://tanstack.com/start/latest"]
  - ["Effect", "https://effect.website"]
  - ["Drizzle", "https://orm.drizzle.team"]
  - ["Cloudflare Workers", "https://www.cloudflare.com/workers/"]
  - ["Turso", "https://turso.tech"]
---

## Background

KitBuild is a reimplementation of the [Kit-Build Concept Map](https://collab.kit-build.net/) platform, which the Learning Engineering Laboratory at Hiroshima University has run since 2009. I built it for my bachelor thesis. It used to be called Yomilink.

The assessment methods (automatic map diagnosis, kit generation, feedback) all come from the original research, and credit for them belongs to the researchers. It adds a research dashboard and a quiz builder on top, but no new pedagogy. The point was to rebuild the proven parts on modern infrastructure, so it runs on Cloudflare Workers and Turso without a VPS.

## How it works

1. The instructor creates a goal map, an expert concept map with the correct relationships
2. The system disassembles it into a kit of concepts and links
3. Students rebuild the map from the kit
4. The system compares each map with the goal map and shows where the misunderstandings are

## What's in it

- A concept map editor for goal maps
- Automatic kit generation and map diagnosis
- A quiz builder for pre-test, post-test, delayed test, and questionnaires, so researchers don't need external forms
- Assignment management with deadlines, time limits, and access controls
- A research dashboard with exportable data
