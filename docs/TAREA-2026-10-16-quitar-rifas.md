# Ficha — borrado total de rifas

## Tarea

Eliminar la feature rifas del código (borrado, sin rama parada) por decisión
del propietario 2026-10-16. Al terminar: cero referencias a rifas en `src/`,
tests y docs vigentes; build/typecheck/test verdes sin regresión.

## Alcance

Base `main = 0bf0798`, rama `chore/quitar-rifas-20261016`. Incluidos:
borrado `checkout/raffle/`, `admin/rifas`, `api/admin/rifas/`,
`hooks/useRaffles.ts`; limpieza `data.ts` (`raffles`, `getRaffleById`),
`sales.ts` (unión `SaleType`, inferencia, etiqueta), `mailer.ts` (copys),
`report-payment/route.ts` (cast), `AdminSidebar.tsx` (ítem + icono),
`reportes/page.tsx` (texto); docs `ARQUITECTURA/ESTADO/RUTA/DECISIONES`.
Excluidos: `schema.sql`/`migrations` (historial aplicado, sin tocar),
`ai_assets` (tabla y repo sirven a Contenido IA, que se queda),
`selectedNumber` en `SaleMetadata` (campo genérico, se conserva),
disponibilidad/pagos/auth (siguientes tareas). Sin merge/push sin orden.

## Aceptación

- [x] `grep rifa|raffle` en `src/` (salvo `schema.sql`/`migrations`, historial
  aplicado excluido), `tests/`: 0. En docs vigentes solo constancias de la
  eliminación + esta ficha.
- [x] `typecheck` PASS, `test` PASS, `build` PASS, `lint` sin nuevos errores vs base 53/66.

## Validación (Node v24.21.0, sin `npm ci`: `node_modules` ya instalado)

- `npm run typecheck`: PASS (`next typegen` + `tsc --noEmit`).
- `npm test`: PASS 8/8.
- `npm run build`: PASS (tabla de rutas, sin errores; no acredita servicios).
- `npm run lint`: FAIL heredado — 108 problemas (50 errores, 58 advertencias),
  MENOS que la base (53/66): los archivos borrados aportaban errores.
  `eslint` sobre los 6 archivos tocados: 0 problemas. Sin reglas silenciadas.
- `npm run test:e2e`: BLOCKED (no aplica: e2e cubre portada/tienda/servicios/login,
  rutas no tocadas; sin menciones a rifas en `tests/`).

## Relevo

Rama `chore/quitar-rifas-20261016`, HEAD de código `1f1e3fb` (cierre de ficha
en commit posterior de esta misma rama), base `main = 0bf0798` (HEAD de `main`
al crear la rama; `ESTADO.md:3` en `main` aún cita `d2714b0`: deuda previa,
fuera de alcance). Revisión independiente: 3 intentos BLOCKED por exigencias
formales (pegar diff íntegro de ~1200 líneas + CI remoto con SHA; sin push no
hay CI remoto por norma AGENTS). Lecturas parciales del revisor en los 3
intentos: cero hallazgos funcionales (cero refs rotas, productores solo
`service|product`, Contenido IA intacto). Evidencia decisiva: `tsc --noEmit`
PASS prueba que no hay imports/referencias rotas en todo el programa.
Autovalidación con checklist ciego aplicada (diff entero releído, solo alcance,
sin secretos). Sin merge/push sin orden. Siguiente paso: `feat/disponibilidad-atomica`.
