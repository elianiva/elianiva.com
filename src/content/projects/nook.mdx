---
title: Nook
date: 2026-10-03
description: A fast, simple SRS flashcard app. Import an Anki deck, review with FSRS, works offline as a PWA.
source: https://github.com/elianiva/nook
demo: https://nook.elianiva.com
type: personal
featured: true
stack:
  - ["Foldkit", "https://foldkit.dev"]
  - ["Effect", "https://effect.website"]
  - ["Cloudflare Workers", "https://www.cloudflare.com/workers/"]
  - ["Cloudflare D1", "https://developers.cloudflare.com/d1/"]
  - ["Alchemy", "https://alchemy.run"]
---

## Background

Nook is a spaced repetition app. You import an Anki deck, review the cards with FSRS-6 scheduling, and it keeps working when your connection drops. It's built as one app for one person: your collection lives in your own Cloudflare account, so there's no sign-up, no password, and no account to manage.

I built this by prompting [Amp](https://ampcode.com), with no manual code. My setup is on [/uses](/uses).

## What it does

- Imports modern `.apkg` decks, including note templates, styling, and media
- Schedules new cards with FSRS-6 (imported Anki scheduling history is not carried over, so imported cards start as new)
- Prefetches the next 200 cards into IndexedDB so reviewing never waits for the network
- Installs as a PWA, and grades made offline sync when you reconnect
- Undo for the last grade, per-day limits, and a JSON export of the whole collection

## Decisions

The repo keeps its design decisions as ADRs in [`docs/adr`](https://github.com/elianiva/nook/tree/main/docs/adr). Four of them:

- **Review from a prefetched queue**: the device grades cards against a local queue instead of waiting for a round trip
- **The server orders reviews**: every grade is an append-only row in a review log and the server ignores replays, so there's no other conflict path
- **D1 with `batch()` instead of transactions**: D1 doesn't have transactions, so multi-statement writes go through one batch
- **Queries own their fetch state**: each read holds its last answer, reloads in place, and ignores a late response from an older request

A Worker can't read an `.apkg` archive, because workerd's `node:sqlite` is a stub. So the import runs in a Web Worker in the browser and streams notes, cards, and media into D1 and R2 in batches. The import is keyed by the archive's content hash, so importing the same file twice overwrites instead of duplicating, and a run that fails halfway resumes where it stopped.

## Not done yet

There's no card editor. You import, you don't author. There's also no delete yet.
