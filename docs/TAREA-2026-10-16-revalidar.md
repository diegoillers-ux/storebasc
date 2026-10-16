# Ficha de tarea — revalidar HEAD + puntos 2/3/4

## Tarea

Revalidar `docs/ESTADO.md` sobre el HEAD real (`26ca7f3`, no `a701f27`/`aca6158`)
y dejar base verificada para decidir continuación (ramas por función,
arquitectura, seguridad). El propietario podrá comprobar la tabla de
verificación y el relevo con rama/HEAD/evidencia.

## Alcance

Incluido: `docs/ESTADO.md` (fecha, base, HEAD verificado); corridas
`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`,
`npm run test:e2e`. Base: `main` en `26ca7f3`.
Rama corta: `chore/revalidar-head-20261016`. Sin merge, deploy ni escrituras
remotas sin orden explícita (solo push de rama + PR borrador).
Excluido: correcciones de lint, cambios de código/arquitectura/seguridad
(puntos 2/3/4 van en ramas propias); verificación remota (Supabase/Vercel/MP);
rotación de secretos.

## Aceptación

- [x] Tabla de verificación revalidada sobre `26ca7f3` con PASS/FAIL/BLOCKED,
  evidencia y límites.
- [x] `docs/ESTADO.md` actualizado a fecha/base/HEAD reales.
- [ ] Siguiente paso (punto 3: correcciones `ARQUITECTURA.md`; punto 4:
  auditoría seguridad en aislado) en ramas propias, con reviewer si tocan
  riesgo.

## Validación

Corridos sobre HEAD final de la rama (mismo árbol que `26ca7f3` + solo
`docs/ESTADO.md`):

| Comando | Resultado | Evidencia / límites |
|---|---|---|
| `npm run typecheck` | PASS | `next typegen + tsc --noEmit`, exit 0 |
| `npm test` | PASS 6/6 | `node --import tsx --test tests/*.test.ts`, 6 pass 0 fail |
| `npm run build` | PASS | build Next completo, rutas + Proxy (Middleware); no acredita servicios |
| `npm run test:e2e` (Chromium) | PASS 4/4 | portada, tienda, servicios, login; sin pagos ni reservas |
| `npm run lint` | FAIL heredado 53/66 | exit 1, `119 problems (53 errors, 66 warnings)`; deuda sin silenciar, sin cambios de código |
| Dominio conocido | BLOCKED | no reprobado en esta tarea; se mantiene “HTTP 200 Ananda; commit/entorno desconocidos” |

Deuda heredada visible, reglas no silenciadas. No se leyeron secretos ni `.env`.

## Relevo

- Rama: `chore/revalidar-head-20261016`. HEAD inicial: `26ca7f3`; HEAD final:
  `eea3320` (mismo árbol + `docs/ESTADO.md` y esta ficha).
- Archivos: `docs/ESTADO.md` (editado); esta ficha (nueva).
- Revisión: fuera de zona de riesgo (solo docs + checks) → autovalidación con
  checklist ciego (diff entero releído, solo `ESTADO.md` + ficha, sin código).
  Sin reviewer (no toca pagos/auth/datos/secretos/integraciones).
- Fallos: lint 53/66 heredado, sin autorización SB-002.
- Decisión pendiente del propietario: autorizar (a) PR borrador de esta rama,
  (b) rama `docs/corregir-arquitectura` (punto 3: rutas `src/lib/auth*`,
  `src/middleware.ts`, `src/lib/supabase/*`, versión NextAuth v5), (c) auditoría
  de seguridad en aislado (punto 4: demo bypass, `requireAdminSession`, RLS,
  firma MP, Blob, `CRON_SECRET`) con reviewer obligatorio.
- Siguiente paso: push rama + PR borrador; luego ramas cortas por función
  (`feat/disponibilidad-atomica`, `feat/pagos-pedidos-idempotencia`,
  `feat/auth-roles-rls`) según `docs/RUTA.md`.

## Revisión (modelo híbrido)

- Zona de riesgo: no aplica a esta rama (docs + checks).
- Autovalidación ciega: diff releído entero, alcance respetado, límites
  declarados. `APPROVE` propio no autoriza merge ni deploy.
