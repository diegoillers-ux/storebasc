# Estado — Storebasc / anandacore

> Una pantalla, mirada hacia adelante. La evidencia de verificación vive en las
> fichas (`docs/TAREA-*.md`), no aquí.
> Actualizado: 2026-10-16 · base `main = origin/main = f40e195` (PR #25: reviewer + auto-merge).

## Now

- Sin rama de producto activa. Última sesión: PRs #18–#25 fusionadas (rifas fuera,
  disponibilidad atómica, guardia `ends_at`, idempotencia de pagos, e2e sandbox MP,
  estado consolidado, reviewer arreglado + auto-merge nativo).
- Flujo de cierre vigente: PR lista (no borrador) + auto-merge; GitHub fusiona en
  verde (3 checks) y borra la rama.

## Next

1. Auth/roles/RLS (mínimo privilegio #2, confirmar RLS #5) — primera prioridad de `docs/RUTA.md`.
2. Parciales: definir regla de negocio y E2E manual de pagos.
3. Verificación remota restante: Vercel (lectura), Blob, SMTP, cron.

## Blockers

- Rotación de credenciales expuestas (Google/Supabase) pendiente.
- Entorno remoto sin lectura (RLS, roles, esquema, Vercel).

## Archivos clave

- Protocolo y límites: `AGENTS.md`
- Arquitectura: `docs/ARQUITECTURA.md` · Prioridades: `docs/RUTA.md`
- Decisiones: `docs/DECISIONES.md` · Modelo de ficha: `docs/TAREA-MODELO.md`
- Ficha activa: (ninguna)

## Última verificación

- 2026-10-16 sobre `413f9fa`/`c338a13` (PRs #22–#24): `npm test` PASS 21/21 ·
  `typecheck` PASS · `build` PASS · `test:e2e` PASS 4/4 smoke + 3/3 sandbox MP ·
  sandbox MP de veras (APRO → webhook 200 → reserva CONFIRMED) · Supabase remoto
  (`weekly`, `blocked_slots`, guardia antisolape, `adjust_product_stock`) ·
  `lint` FAIL heredado 43/55 (sin silenciar). Evidencia: `docs/TAREA-2026-10-16-*.md`.
