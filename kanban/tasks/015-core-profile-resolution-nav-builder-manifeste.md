---
id: 15
title: 'Core: Profile-Resolution + Nav-Builder (Manifeste + profiles.json)'
status: done
priority: high
created: 2026-06-28T13:47:32.009523081+02:00
updated: 2026-06-28T16:55:42.949318164+02:00
started: 2026-06-28T16:51:57.901782169+02:00
completed: 2026-06-28T16:55:42.950283845+02:00
tags:
    - core
depends_on:
    - 4
    - 8
class: standard
---

## Ziel
Profile als partielle Filter über Dimensionen auflösen und daraus gefilterte Nav-Manifeste + `profiles.json` erzeugen.

## Scope / Akzeptanzkriterien
- Profile-Resolver: partielle Filter, unspezifizierte Dimensionen = ungefiltert (Design-Entscheidung 5).
- Nav-Manifest-Parser (`nav/*.yaml`) inkl. verschachtelter Sections.
- Pro Profil ein gefiltertes Nav-Manifest (statisch, framework-agnostisch).
- `profiles.json` für optionales Client-Switching.
- Tests gegen Fixtures (#3).

## Depends on
#4 (Schema-Loader), #8 (Indexer)

## Out-of-scope
CLI `nav build` (#17), Rendering.
