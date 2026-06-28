---
id: 9
title: 'CLI: scaffold + validate + index'
status: backlog
priority: high
created: 2026-06-28T12:55:01.0632364+02:00
updated: 2026-06-28T13:48:23.943676439+02:00
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
