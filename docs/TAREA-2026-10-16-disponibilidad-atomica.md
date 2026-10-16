# Ficha — disponibilidad fiable (P1)

## Tarea

Cerrar los huecos verificados del ciclo de reservas: solapes no detectados,
carrera check-then-insert, horas reconstruidas, bloqueos sin persistir y
franjas en huso del servidor. Al terminar: solapes cubiertos en código,
atomicidad lista a nivel código + migración, horas/bloqueos persistidos a
nivel código + migraciones, y prueba UTC/Bogotá en tests.

## Alcance

Base `main = 7d3f430` (PR #18), rama `feat/disponibilidad-atomica-20261016`.
Incluidos: `lib/calendar/overlaps.ts` (nuevo, puro) + `tests/overlaps.test.ts`;
`repositories/bookings.ts` (ventana ampliada, filtro compartido, código PG
preservado); `api/bookings/create` (mapeo 23P01/23505 → 409);
`repositories/availability.ts` (columna `weekly` con retroceso heredado,
`blocked_slots` real); `lib/calendar/google.ts` (franjas en hora Bogotá,
recorte a ventana); `api/calendar/create-pending` (ventana + filtro);
3 migraciones + `schema.sql` canónico. Excluidos: aplicar migraciones en
Supabase (sin acceso: P0 pendiente), UI de bloqueos (sin llamadores hoy),
`generateAvailableDays` (no consulta `work_days`: cosmético, anotado),
RUTA/ESTADO (los toca el PR #19 pendiente). Sin merge/push sin orden.

## Aceptación

- [x] `tests/overlaps.test.ts` (9 casos): solapes parciales/envolventes/adyacencia,
      reserva iniciada antes del rango, UTC≡Bogotá, semana/partes Bogotá,
      ventana 24h. Un fallo inicial fue expectativa errada del test
      (lunes 19, no domingo): corregido, código intacto.
- [x] `typecheck` PASS, `test` PASS 17/17, `build` PASS, `lint` sin nuevos errores.
- [ ] Migraciones marcadas PENDIENTE con bloqueo explícito (acceso Supabase).

## Validación (Node v24.21.0, sin `npm ci`: `node_modules` ya instalado)

- `npm run typecheck`: PASS.
- `npm test`: PASS 17/17 (8 heredados + 9 nuevos de `overlaps`).
- `npm run build`: PASS (no acredita servicios).
- `npm run lint`: FAIL heredado — 105 problemas (50 errores, 55 advertencias);
  base post-rifas 50/58: 0 errores nuevos (1 warning `_bookingId` preexistente).
  `eslint` sobre los 6 `.ts` tocados: 0 errores. Sin reglas silenciadas.
- `npm run test:e2e`: BLOCKED (requiere Chromium + credenciales; rutas de
  calendario no cubiertas por los 4 e2e existentes).
- Migraciones (`add_availability_weekly_config`, `add_blocked_slots`,
  `add_booking_overlap_guard`): PENDIENTES DE APLICAR — sin acceso Supabase
  (RUTA P0). Código compatible pre/post aplicación (retrocesos incluidos).

## Relevo

(pendiente: HEAD, revisión independiente obligatoria — zona datos —,
siguiente paso)
