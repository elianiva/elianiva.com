---
title: Spectator
date: 2022-06-01
description: A browser-based coding exam platform with integrated telemetry for emotion tracking.
source: https://github.com/teknologi-umum/spectator
type: open-source
featured: false
stack:
  - ["TypeScript", "https://typescriptlang.org/"]
  - ["React", "https://react.dev/"]
  - ["Docker", "https://www.docker.com/"]
  - ["Go", "https://go.dev/"]
  - ["Python", "https://www.python.org/"]
---

## Background

**Spectator** is a browser-based coding exam platform, similar to HackerRank,
with integrated telemetry for emotion tracking. It is open source at
[teknologi-umum/spectator](https://github.com/teknologi-umum/spectator).

The interesting part is what happens around the answers. Candidates work in the
browser while the platform captures the whole session — clicks, keystrokes,
mouse paths — and streams it to an ASP.NET Core service, because the research
was about how people solve problems and not only what they finally submit.

A Go worker queries the time-series data and exports it, so researchers can
download the raw datasets on demand. A Python generator produces synthetic
interactions for load testing, and Docker Compose brings the whole stack up in
one command.

## What I worked on

Building the exam platform itself, including internationalisation, and keeping
the activity capture complete enough that the researchers could trust the data.
