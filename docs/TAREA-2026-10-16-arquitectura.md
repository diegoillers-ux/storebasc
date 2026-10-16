# Ficha de tarea — corregir ARQUITECTURA (punto 3, docs)

## Tarea

Corregir las 3 imprecisiones de `docs/ARQUITECTURA.md` detectadas en la
auditoría del 2026-10-16, sin tocar código. El propietario podrá comprobar que
las rutas del documento coinciden con el árbol real.

## Alcance

Incluido: `docs/ARQUITECTURA.md` (rutas auth/datos/calendario/notifs/demo,
versiones NextAuth/Nodemailer, cron). Base: `main` en `26ca7f3`.
Rama corta: `docs/corregir-arquitectura-20261016`. Sin merge, deploy ni
escrituras remotas sin orden explícita (solo push + PR borrador).
Excluido: renombre `anandastore-v2`, migración `middleware`→`proxy`,
resolución peer Nodemailer/NextAuth, núcleo configurable (decisiones del
propietario, van en ramas propias).

## Aceptación

- [x] Rutas auth apuntan a `src/lib/auth.ts`, `src/lib/auth.config.ts`,
  `src/lib/adminAuth.ts`, `src/middleware.ts` (verificado con `ls`).
- [x] Datos apuntan a `src/lib/supabase/` (`schema.sql`, `migrations/`,
  `repositories/`) + nota `supabase/` vacía.
- [x] Versiones: NextAuth `^5.0.0-beta.32` (v5 beta) + Nodemailer `^10.0.13`
  (verificado en `package.json`); cron con schedules reales
  (`0 8 * * *`, `0 9 * * *` de `vercel.json`).

## Validación

Cambio solo-docs: no afecta compilación ni tests (base `26ca7f3` ya validada
en ficha `TAREA-2026-10-16-revalidar`: typecheck PASS, test 6/6 PASS, build
PASS, e2e 4/4 PASS, lint FAIL heredado 53/66).

| Comando | Resultado |
|---|---|
| `ls` rutas citadas + `grep` versiones + lectura `vercel.json`/`next.config.ts` | PASS |
| `npm run typecheck/test/build/lint/e2e` | BLOCKED (no aplica: sin cambios de código; base ya validada) |

## Relevo

- Rama: `docs/corregir-arquitectura-20261016`. HEAD inicial: `26ca7f3`;
  commit de contenido: `71794a9` (solo `docs/ARQUITECTURA.md` + esta ficha);
  HEAD final de la rama: ver `git rev-parse` (solo ajustes de constancia
  posteriores, sin cambios de alcance).
- Archivos: `docs/ARQUITECTURA.md` (editado); esta ficha (nueva).
- Revisión: fuera de zona de riesgo (solo docs) → autovalidación con checklist
  ciego. Sin reviewer.
- Decisión pendiente del propietario: (a) renombre paquete `anandastore-v2` →
  `storebasc` (sí/no/cuándo), (b) migrar `src/middleware.ts` a convención
  vigente Next 16, (c) fijar resolución peer Nodemailer/NextAuth-v5,
  (d) autorizar auditoría de seguridad (punto 4) con reviewer.
- Siguiente paso: push + PR borrador; luego punto 4 (auditoría seguridad en
  aislado, `feat/*` según `docs/RUTA.md`).

## Revisión (modelo híbrido)

- Zona de riesgo: no aplica (docs, sin pagos/auth/datos/secretos/integraciones).
- Autovalidación ciega: diff releído entero, alcance respetado, límites
  declarados. Sin autoaprobación en riesgo.
