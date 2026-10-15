# SB-003 — Higiene de identidad y seguridad básica

## Objetivo

Dejar el estado documental coherente con la realidad verificada (merge `aca6158`, despliegue 200 con commit desconocido), fijar la identidad Storebasc-núcleo / anandacore-cliente y blindar `.gitignore` contra archivos con apariencia de secretos. Sin renombrar código, sin segundo repo y sin ramas de larga vida hasta la versión madura.

## Aceptación

- [x] `.gitignore` ignora los 3 archivos con apariencia de secretos presentes en raíz (verificado con `git check-ignore`; contenido no leído).
- [x] `AGENTS.md` y `docs/agent-loop/LOOP.md` reflejan la decisión 2026-10-15 (anandacore, workspace-hub no se usa).
- [x] `docs/PROJECT-STATE.md` refleja `aca6158` como base, PR #2/#3 integradas y dominio 200 con commit desconocido.
- [ ] Revisión independiente del diff y decisión del dueño (integrar o no).
- [ ] El dueño responde las preguntas pendientes (estrategia dos proyectos, alcance de renombre en código, destino de secretos, accesos remotos, autorización SB-002).

## Rama y base

- Rama: `chore/higiene-identidad-20261015`, desde `main` en `aca6158`.
- Archivos tocados: `.gitignore`, `AGENTS.md`, `docs/PROJECT-STATE.md`, `docs/agent-loop/LOOP.md`, esta ficha.
- No se tocan: código `src/`, secretos (solo nombres), remotos, ramas `main`/`V2`.

## Verificaciones

- `git status --porcelain=v1 -b` (solo `M` esperados + 3 `??` ahora ignorados tras el cambio).
- `git check-ignore -v` sobre los 3 nombres (redactado en el relevo, nunca el contenido).
- `git diff --check` sin errores de espacios.
- Esta tarea es documental + `.gitignore`: no requiere `npm run lint/typecheck/test/build` (sin archivos JS/TS cambiados; CI dirá "sin archivos JS/TS cambiados").

## Bloqueos

- Contenido de secretos no leído ni rotado; rotación Google/Supabase pendiente del propietario.
- Commit/entorno desplegado en Vercel desconocido; Supabase remoto sin inspeccionar.
- `QUEUE.json`/`HANDOFF.md` siguen describiendo BOOT-001; su actualización requiere autorización del dueño (no se tocan en esta tarea).

## Relevo / siguiente paso

1. Pasar diff completo + esta ficha a revisor independiente (solo lectura).
2. El dueño decide si integra esta rama y responde preguntas pendientes.
3. Después, y solo con autorización, SB-002 (lint) u otra tarea.
