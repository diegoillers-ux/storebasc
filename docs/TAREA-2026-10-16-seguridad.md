# Ficha de tarea — auditoría seguridad (punto 4, solo lectura)

## Tarea

Auditar seguridad (obviando secretos: sin leer `.env` ni credenciales) y dejar
hallazgos verificados + revisión independiente para priorizar fixes. Sin
cambios de código en esta rama.

## Alcance

Incluido: lectura `src/lib/demoMode.ts`, `src/lib/adminAuth.ts`,
`src/middleware.ts`, `src/lib/auth.ts`, `src/lib/auth.config.ts`,
`src/lib/payments/mercadopago.ts`, `src/app/api/webhooks/mercadopago/route.ts`,
`src/lib/cronAuth.ts`, `src/app/api/cron/*/route.ts`,
`src/lib/supabase/schema.sql` (RLS), `.env.example` (nombres, no valores).
Base: `main` en `26ca7f3`. Rama corta: `docs/auditoria-seguridad-20261016`.
Sin merge, deploy ni escrituras remotas sin orden explícita.
Excluido: fixes (van en `feat/*` con reviewer); rotación de secretos;
verificación remota.

## Aceptación

- [x] Hallazgos verificados por lectura con archivo:línea.
- [x] Revisión independiente del subagente reviewer (1 ronda, solo lectura).
- [ ] Fixes autorizados por el propietario en ramas propias.

## Validación

Solo lectura: no aplica `lint/typecheck/test/build/e2e` (sin cambios de código;
base `26ca7f3` validada en `TAREA-2026-10-16-revalidar`: typecheck PASS, test
6/6 PASS, build PASS, e2e 4/4 PASS, lint FAIL heredado 53/66).

## Hallazgos + veredicto reviewer (1 ronda)

| # | Hallazgo | Veredicto | Severidad | Acción propuesta |
|---|---|---|---|---|
| 1 | Bypass demo (`demoMode.ts:1-3` → `adminAuth.ts:6-8`, `middleware.ts:14-16`, `auth.ts:22-26` otorga SUPER_ADMIN; `NEXT_PUBLIC_*` no es protección; sin fail-closed en prod) | CONFIRMADO | alta | Guard inmediato: fallar cerrado en prod si `true` (o var solo-servidor + `NODE_ENV!=='production'`); exige rama `feat/*` + reviewer |
| 2 | `requireAdminSession` binario, `AdminRole` sin uso (`auth.ts:6`, `auth.config.ts:58,76`); ~14 rutas `/api/admin/*` con poder total | CONFIRMADO | media | Diferir salvo necesidad mínimo privilegio (`requireRole([...])`) |
| 3 | Webhook MP: HMAC correcto (falla cerrado en prod, doble manifest), idempotencia por `reference UNIQUE` + `getByReference`, no confirma bajo-pago, stock solo desde PENDING. Gaps: `!==` en vez de `timingSafeEqual`, sin ventana `ts`, raza check-then-insert, `400 details` verboso | PARCIAL | media/baja | Endurecimiento diferible |
| 4 | Cron `cronAuth.ts:4-23` (`timingSafeEqual`, obligatorio en prod) enforced en ambos crons con 401 | CORRECTO | — | Nada |
| 5 | RLS: ENABLE en todas + 4 SELECT públicas + full solo `service_role`; cero escrituras anon/authenticated | PARCIAL | baja | Confirmar ningún path escribe con anon-key |
| 6 | `ADMIN_EMAILS` reales en `.env.example:20` + fallback SUPER_ADMIN (`auth.ts:34-39`) | CONFIRMADO | baja | Placeholder `admin@example.com` |
| 7 | `as any` (`middleware.ts:10`, `auth.ts`) | CONFIRMADO | baja | Tipar sesión/token |

Nota reviewer: BLOCKED formal por falta de ficha/diff/CI al momento de la
revisión; veredictos por hallazgo emitidos igual y recogidos aquí.

## Relevo

- Rama: `docs/auditoria-seguridad-20261016`. HEAD inicial: `26ca7f3`;
  commit de contenido: ver `git log` (solo esta ficha).
- Archivos: esta ficha (nueva). Cero cambios de código.
- Revisión: reviewer independiente, 1 ronda, veredictos arriba. Máximo 3
  rondas; no se requirieron correcciones (auditoría, sin diff).
- Decisión pendiente del propietario: autorizar (a) guard fail-closed demo en
  prod (alta, inmediata), (b) qué endurecimientos MP/roles/PII entran en
  `feat/*` y en qué orden, (c) merge de PRs #12 y #13.
- Siguiente paso: ramas cortas por función según `docs/RUTA.md`
  (`feat/disponibilidad-atomica`, `feat/pagos-pedidos-idempotencia`,
  `feat/auth-roles-rls`).

## Revisión (modelo híbrido)

- Zona de riesgo: sí (auth, pagos, integraciones) → reviewer independiente
  aplicado (contexto separado, solo lectura). `APPROVE` no autoriza merge.
