# Ficha de tarea — demo fail-closed en producción (fix #1 auditoría)

## Tarea

Cerrar el hallazgo #1 (severidad alta) de la auditoría de seguridad
(`TAREA-2026-10-16-seguridad.md`): el modo demo otorga bypass de autenticación
(SUPER_ADMIN) y datos de ejemplo si `NEXT_PUBLIC_DEMO_MODE=true`, incluso en
producción. Al terminar, el propietario podrá comprobar que en producción
(`NODE_ENV=production`) el modo demo queda desactivado aunque la variable esté
mal configurada, sin tocar la operación normal de un entorno aislado de demo.

## Alcance

Incluido:

- `src/lib/demoMode.ts` — guard fail-closed en el único chokepoint del bypass.
- `tests/demoMode.test.ts` — prueba de regresión (nuevo).
- `.env.example` — solo el comentario de `NEXT_PUBLIC_DEMO_MODE` (nombres, no
  valores).
- `docs/ENTORNOS.md` — regla de producción alineada con el fail-closed.
- Esta ficha.

Excluido: resto de hallazgos de la auditoría (#2 roles binarios, #3
endurecimiento webhook MP, #5 RLS, #6 `ADMIN_EMAILS` reales en `.env.example`,
#7 `as any`); migración `middleware`→`proxy`; SB-002 (lint); rotación de
secretos; verificación remota.

Base: `main` en `776c429`. Rama corta: `feat/demo-fail-closed-prod`. Sin merge,
deploy ni cambios de autorizaciones sin orden explícita.

## Diseño

`isDemoMode()` es el **único** punto por el que pasan todos los consumidores del
bypass: `src/middleware.ts:14`, `src/lib/adminAuth.ts:6`, el callback `jwt` en
`src/lib/auth.ts:22` y las rutas API/páginas. El guard concentra el fail-closed
ahí: con `NODE_ENV === 'production'` devuelve `false` (y registra un aviso una
sola vez si la variable estaba en `true`). No se renombra la variable ni se
tocan middleware/auth, para mantener el diff mínimo y auditable.

Límite declarado: `isDemoMode()` es sensible a `NODE_ENV`; en Vercel los
deployments de *preview* corren con `NODE_ENV=production`, así que allí el demo
también queda cerrado (deseable: un preview toca servicios reales). Si en el
futuro se necesita un entorno demo no-`development`, deberá introducirse una
variable de opt-in explícita solo-servidor (fuera de alcance).

## Aceptación

- [x] `isDemoMode()` devuelve `false` con `NODE_ENV=production` y
  `NEXT_PUBLIC_DEMO_MODE=true` — probado en `tests/demoMode.test.ts`.
- [x] El bypass queda cerrado para todos los consumidores — verificado que
  middleware, `adminAuth` y el `jwt` de auth llaman al chokepoint.
- [ ] Revisión independiente reviewer (zona de riesgo auth) — en curso.
- [ ] Decisión del propietario (aceptar/merege del PR borrador).

## Validación

Corridos sobre el árbol de la rama (base `776c429` + cambios de esta ficha):

| Comando | Resultado | Evidencia / límites |
|---|---|---|
| `npm run typecheck` | PASS | `next typegen && tsc --noEmit`, exit 0 |
| `npm test` | PASS 8/8 | `node --import tsx --test tests/*.test.ts`; 2 nuevas (`demoMode`), 6 heredadas |
| `npm run build` | PASS | build Next completo + Proxy; no acredita servicios |
| `npm run test:e2e` (Chromium) | PASS 4/4 | portada, tienda, servicios, login; sin pagos ni reservas |
| `npx eslint src/lib/demoMode.ts tests/demoMode.test.ts` | PASS | exit 0 (mismo lint por-diff que CI) |
| `npm run lint` | FAIL heredado 53/66 | exit 1, `119 problems (53 errors, 66 warnings)`; deuda sin silenciar, sin cambios respecto a `main` |

Deuda heredada visible; reglas no silenciadas. No se leyeron secretos ni `.env`
(contenido de `.env.example`: solo nombres/valores de ejemplo).

## Relevo

- Rama: `feat/demo-fail-closed-prod`. HEAD inicial: `776c429`; HEAD final: ver
  `git log` (commit de contenido + constancia de revisión).
- Archivos: `src/lib/demoMode.ts` (editado), `tests/demoMode.test.ts` (nuevo),
  `.env.example` (comentario), `docs/ENTORNOS.md` (nota), esta ficha (nueva).
- Revisión: zona de riesgo (auth/roles) → reviewer independiente obligatorio,
  contexto separado y solo lectura. Veredicto: pendiente.
- Fallos: lint 53/66 heredado.
- Hallazgo residual (no tocado por alcance): `ADMIN_EMAILS` con correos reales
  en `.env.example:20` (hallazgo #6, baja).
- Decisión pendiente del propietario: aceptar el guard y mergear/descartar el
  PR borrador; autorizar (o no) el resto de fixes de la auditoría en ese orden.
- Siguiente paso: PR borrador; si se aprueba, push de rama + PR (sin merge sin
  orden).

## Revisión (modelo híbrido)

- Zona de riesgo: sí (auth/roles, bypass de autenticación) → reviewer
  independiente aplicado (contexto separado, solo lectura). `APPROVE` no
  autoriza merge ni deploy.
