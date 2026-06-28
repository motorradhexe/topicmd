---
id: 27
title: 'Docs-Site: echte technische Doku auf Astro Starlight (CLI + Extension)'
status: todo
priority: medium
created: 2026-06-28T18:30:00+02:00
updated: 2026-06-28T18:30:00+02:00
tags:
    - docs
    - pages
depends_on:
    - 13
class: standard
---

## Ziel
Pages-Seite von README-Klon zu echter Referenz für CLI **und** Extension ausbauen.

## Scope / Akzeptanzkriterien
- `docs-site/` als Astro-Starlight-Workspace-Paket (`astro` + `@astrojs/starlight`),
  `astro.config.mjs` mit `site` + `base: '/topicmd/'`, Sidebar Guide/CLI/Schema/VSCode.
- Inhalt unter `src/content/docs/**`: Guide (Konzepte, Quickstart), CLI-Referenz pro
  Command (Optionen, Exit-Codes, Beispiel-Ausgabe, Diagnostic-Codes), Schema-Referenz,
  Extension-Referenz. Inhalt aus echten Quellen abgeleitet.
- altes `index.html`/`style.css` ersetzt; `.nojekyll` im Output.
- `.github/workflows/pages.yml`: Build-Schritt, Upload `docs-site/dist`.
- `pnpm-workspace.yaml` ergänzt; README entschlackt + Verweis auf Doku-Site.
- `pnpm --filter docs-site build` läuft fehlerfrei.

## Depends on
#13 (GitHub-Pages-Setup)
