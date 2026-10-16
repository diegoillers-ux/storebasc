# Ficha de tarea — actualizar ESTADO/DECISIONES tras PR #16

## Tarea

Reflejar en `docs/ESTADO.md` y `docs/DECISIONES.md` la base real y el cierre del
fix #1. El propietario podrá comprobar que la documentación vigente cita
`main = d2714b0`, el PR #16 mergeado y el estado del bypass demo, sin deriva
documental.

## Alcance

Incluido: `docs/ESTADO.md` (fecha/base, tabla de verificación sobre el HEAD
real, "Qué existe", deuda #5); `docs/DECISIONES.md` (entrada de sesión
2026-10-16 cont.); esta ficha.

Excluido: cualquier cambio de código; resto de hallazgos (#2/#3/#5/#6/#7); RUTA
P1; verificación remota; rotación de secretos.

Base: `main` en `d2714b0`. Rama corta: `chore/actualizar-estado-20261016`. Sin
merge, deploy ni escrituras remotas salvo push de la rama y PR borrador.

## Aceptación

- [x] `docs/ESTADO.md` cita `main = origin/main = d2714b0` y PR #16.
- [x] Tabla de verificación revalidada sobre `d2714b0` (test 8/8).
- [x] `docs/DECISIONES.md` registra la sesión: fix #1, reviewer APPROVE, PR #16
  mergeado, rama borrada, pendientes.
- [ ] Decisión del propietario (aceptar PR borrador).

## Validación

Corridos sobre el HEAD de esta rama (base `d2714b0` + solo docs):

| Comando | Resultado | Evidencia / límites |
|---|---|---|
| `npm run typecheck` | PASS | `next typegen && tsc --noEmit`, exit 0 |
| `npm test` | PASS 8/8 | 8 pass 0 fail |
| `npm run build` | PASS | build Next completo + Proxy; no acredita servicios |
| `npm run test:e2e` (Chromium) | PASS 4/4 | portada, tienda, servicios, login |
| `npm run lint` | FAIL heredado 53/66 | `119 problems (53 errors, 66 warnings)`; sin cambios vs `main` |

Cambio solo-docs: no altera compilación ni tests. Deuda heredada visible;
reglas no silenciadas. No se leyeron secretos ni `.env`.

## Relevo

- Rama: `chore/actualizar-estado-20261016`. HEAD inicial: `d2714b0`; HEAD final:
  ver `git log`.
- Archivos: `docs/ESTADO.md`, `docs/DECISIONES.md` (editados); esta ficha
  (nueva).
- Revisión: fuera de zona de riesgo (solo docs) → autovalidación con checklist
  ciego (diff releído entero, sin código). Sin reviewer.
- Fallos: lint 53/66 heredado.
- Decisión pendiente del propietario: aceptar/mergear el PR borrador y
  autorizar la siguiente tarea (hallazgos #2/#3/#5/#6/#7 o RUTA P1).
- Siguiente paso: PR borrador; sin merge sin orden.

## Revisión (modelo híbrido)

- Zona de riesgo: no aplica (docs, sin pagos/auth/datos/secretos/integraciones).
- Autovalidación ciega: diff releído entero, alcance respetado, límites
  declarados. `APPROVE` propio no autoriza merge ni deploy.
