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

(pendiente: HEAD, revisión, siguiente paso)
