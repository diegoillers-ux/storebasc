# Ficha de tarea — demo fail-closed en producción (fix #1 auditoría)

## Tarea

Cerrar el hallazgo #1 (severidad alta) de la auditoría de seguridad
(`TAREA-2026-10-16-seguridad.md`): el modo demo otorga bypass de autenticación
(SUPER_ADMIN) y datos de ejemplo si `NEXT_PUBLIC_DEMO_MODE=true`, incluso en
producción. Al terminar, el propietario podrá comprobar que en producción
(`NODE_ENV=production`) el modo demo queda desactivado aunque la variable esté
mal configurada. En un entorno aislado servido con `NODE_ENV` distinto de
`production` (p. ej. `next dev` local) el demo sigue operativo.

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
- [x] Revisión independiente reviewer (zona de riesgo auth) — APPROVE, 1 ronda.
- [ ] Decisión del propietario (aceptar/merge del PR borrador).

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
  contexto separado y solo lectura. Veredicto: **APPROVE**, 1 ronda, sin
  cambios obligatorios. Observaciones P3 registradas abajo.
- Fallos: lint 53/66 heredado.
- Hallazgo residual (no tocado por alcance): `ADMIN_EMAILS` con correos reales
  en `.env.example:20` (hallazgo #6, baja).
- Observación de revisión (no bloqueante): `docs/ESTADO.md:3` cita
  `main = 26ca7f3`, pero `main` real es `776c429` (PR #15). Deriva documental
  preexistente, fuera de alcance.
- Decisión pendiente del propietario: aceptar el guard y mergear/descartar el
  PR borrador; autorizar (o no) el resto de fixes de la auditoría en ese orden.
  Además confirmar cómo se aprovisiona el entorno demo aislado (dev local vs
  preview Vercel): si es preview, se necesita una variable de opt-in
  solo-servidor (fuera de alcance).
- Siguiente paso: PR borrador; si se aprueba, push de rama + PR (sin merge sin
  orden).

## Revisión (modelo híbrido)

- Zona de riesgo: sí (auth/roles, bypass de autenticación) → reviewer
  independiente aplicado (contexto separado, solo lectura). `APPROVE` no
  autoriza merge ni deploy.
- Veredicto global: **APPROVE** (sesión `ses_ebd9e6980ffe...`). Confirma:
  (1) los 3 caminos del bypass pasan por el chokepoint y no hay lectura directa
  de `NEXT_PUBLIC_DEMO_MODE` que lo esquive; (2) `NODE_ENV` es correcto en
  server y edge de Next; (4) el test `withEnv` restaura el entorno y prueba el
  fail-closed; (5) el `console.warn` acotado no filtra secretos ni llega al
  navegador; (6) sin regresión operativa esperada.
- Observaciones P3 (no bloqueantes): (a) preview Vercel corre con
  `NODE_ENV=production` y pierde el demo — fail-closed deseable, requiere
  confirmar aprovisionamiento del demo; (b) dependencia de que `NODE_ENV` esté
  definido — residual, ya declarado; (c) el test no ejercita el inlineado de
  build de Next (sí corre el guard en runtime) — cobertura, no defecto.
