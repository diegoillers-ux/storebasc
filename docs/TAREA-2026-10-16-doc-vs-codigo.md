# Ficha — auditoría doc ↔ código (una pantalla, sin supuestos)

## Tarea

Alinear los docs vigentes con el código de `main = 0bf0798`: corregir lo
demostrablemente inexacto y dejar los hallazgos de implementación como
pendientes de validación del propietario (no como pendientes en los docs).

## Alcance

Incluidos (solo docs): `docs/ARQUITECTURA.md`, `docs/ESTADO.md`,
`docs/ENTORNOS.md`, `docs/RUTA.md` + esta ficha. Base `main = 0bf0798`,
rama `chore/doc-vs-codigo-20261016`. Excluidos: código `src/`,
`docs/DECISIONES.md` (constancia del propietario), archivo histórico.
`README.md` verificado sin cambios (ya cita `docs/ESTADO.md`).

## Aceptación

- [ ] Cada corrección cita evidencia `archivo:línea` verificada por lectura.
- [ ] Distinción explícita parcial (UI existe, backend no) vs no implementado.
- [ ] Cero pendientes inventados: lo no validado vive solo en esta ficha.

## Correcciones aplicadas (código manda)

1. `ARQUITECTURA.md`: `supabase/` en raíz NO está vacía (guarda `.temp/` CLI);
   tabla API reescrita con los 31 `route.ts` reales; checkout detallado por
   pasos; catálogos = intentan Supabase con fallback `MOCK_*`
   (`tienda/page.tsx:72-95`); `501` precisado por operación
   (rifas POST `:26` / contenido POST `:24`, GET `[]`); middleware sin
   "obsoleta" (no verificado en guía Next 16); cron con 2 paths.
2. `ESTADO.md`: admin parciales añadidos (`/admin/rifas`, `/admin/contenido`,
   `/admin/reportes` existen como páginas); `proof.ts:3-4` (2 MB, JPG/PNG/PDF).
3. `ENTORNOS.md`: `BLOB_READ_WRITE_TOKEN` y `AUTH_*` anotados como consumo
   implícito (SDK/blob, NextAuth), no variables muertas.
4. `RUTA.md`: módulos `501` nombrados (rifas, contenido IA, visibles en
   `AdminSidebar.tsx:29-31`).

## Descartados (verificado, no son pendientes)

- Firebase/Firestore: 0 menciones en repo vigente (grep excl. archivo).
- Wompi: 2 menciones intencionales (`AGENTS.md:35`, `DECISIONES.md:14`).
- `TODO` en docs vigentes: 0. En `src/`: 3, todos cubiertos por H1/H2.

## Hallazgos pendientes de validación del propietario (no tocar sin orden)

- H1: backend rifas (colección Supabase; `admin/rifas/route.ts:8`, `[id]/route.ts:14`).
- H2: motor IA contenido (Gemini; `content/generate/route.ts:8`).
- H3: métricas reales dashboard/reportes (UI estática `—`).
- H4: ocultar rifas/contenido del sidebar hasta tener backend (RUTA P1).
- H5: confirmar convención middleware en guía Next 16
  (`node_modules/next/dist/docs/`).

## Validación (HEAD final, `npm ci` omitido: `node_modules` ya instalado, Node v24.21.0)

- `npm run lint`: FAIL heredado — 119 problemas (53 errores, 66 advertencias),
  idéntico a la deuda registrada en `ESTADO.md`. Sin reglas silenciadas.
- `npm run typecheck`: PASS (`next typegen` + `tsc --noEmit`).
- `npm test`: PASS 8/8.
- `npm run build`: PASS (tabla de rutas, sin errores; no acredita servicios).
- `npm run test:e2e`: BLOCKED (no aplica: cambio solo-docs, sin rutas tocadas).

## Relevo

Rama `chore/doc-vs-codigo-20261016`, base `main = 0bf0798`. Revisión:
autovalidación con checklist ciego (docs, sin zona de riesgo; prohibido
autoaprobar riesgo). Sin merge/push sin orden. Siguiente paso: orden del
propietario sobre H1–H5 o merge de esta rama.

## Conciliación post-PR #18 (merge `origin/main = 7d3f430`)

Conflictos en `ARQUITECTURA.md`/`ESTADO.md` resueltos a favor de la realidad
post-borrado + precisión de esta rama (tablas/API/fallbacks/`501` por
operación). H1 (backend rifas) y la parte de rifas de H4: obsoletos (rifas
eliminadas, no hay nada que ocultar). H2/H3/H5 y ocultar Contenido IA: vigentes.
