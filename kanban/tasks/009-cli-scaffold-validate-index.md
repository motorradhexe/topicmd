---
id: 9
title: 'CLI: scaffold + validate + index'
status: done
priority: high
created: 2026-06-28T12:55:01.0632364+02:00
updated: 2026-06-28T15:48:09.780470848+02:00
started: 2026-06-28T15:41:46.477086719+02:00
completed: 2026-06-28T15:48:09.781749931+02:00
tags:
    - cli
depends_on:
    - 7
    - 8
class: standard
---

## Ziel
CLI-Grundgerüst (commander) mit den drei Kern-Kommandos.

## Scope / Akzeptanzkriterien
- topicmd validate (Exit 1 bei Fehlern), index, scaffold <type>.
- Konsumiert @topicmd/core; bin: topicmd.
- Tests/Smoke gegen examples/basic (#3).

## Depends on
#7, #8

## Out-of-scope
nav build + i18n status (#17).
