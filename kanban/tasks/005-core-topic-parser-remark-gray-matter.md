---
id: 5
title: 'Core: Topic Parser (remark + gray-matter)'
status: done
priority: high
created: 2026-06-28T12:55:00.3001179+02:00
updated: 2026-06-28T15:30:02.896422195+02:00
started: 2026-06-28T15:26:44.249659955+02:00
completed: 2026-06-28T15:30:02.897990298+02:00
tags:
    - core
depends_on:
    - 2
class: standard
---

## Ziel
Markdown-Topics parsen: Frontmatter + AST.

## Scope / Akzeptanzkriterien
- gray-matter für Frontmatter, unified+remark fürs AST.
- MDX nur wenn Schema extensions:[mdx] deklariert (remark-mdx, JSX opak).
- Extraktion von Links, Headings (für Contracts), Include-Direktiven.
- Tests gegen Fixtures (#3).

## Depends on
#2

## Out-of-scope
Fragment-Auflösung (#6), Variablen (#14), Validierung (#7).
