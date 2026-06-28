---
id: 23
title: 'Core: Frontmatter-Cast defensiv härten'
status: done
priority: low
created: 2026-06-28T18:30:00+02:00
updated: 2026-06-28T19:55:00+02:00
started: 2026-06-28T19:53:00+02:00
completed: 2026-06-28T19:55:00+02:00
tags:
    - core
    - parser
class: standard
---

## Ziel
Unsicheren `data as TopicFrontmatter`-Cast in `parser/parse.ts` absichern.

## Scope / Akzeptanzkriterien
- Nach `matter()` Top-Level-Form prüfen (Guard/Zod-Shape), **ohne zu werfen**;
  bei Fehlform Fallback auf leeres/teilweises Frontmatter.
- Validator bleibt einzige Diagnostics-Quelle (keine Doppelvalidierung).
- Test: malformed Frontmatter führt nicht zu Crash.
