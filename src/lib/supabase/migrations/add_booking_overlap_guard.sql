-- ─────────────────────────────────────────────────────────────
-- Migración: Guardia antisolape atómica en `bookings`
-- PENDIENTE DE APLICAR (requiere acceso Supabase). Ver ficha
-- docs/TAREA-2026-10-16-disponibilidad-atomica.md
-- ─────────────────────────────────────────────────────────────
-- Convierte la carrera check-then-insert de `bookings/create` en un 409
-- garantizado por la BD: dos inserciones concurrentes del mismo rango no
-- pueden prosperar. El código mapea 23P01/23505 a 409.
-- NOTA: si existen solapes activos previos, esta migración falla hasta
-- limpiarlos (consultar reservas duplicadas antes de aplicar).

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_no_overlap_active;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_overlap_active
  EXCLUDE USING gist (
    tstzrange(scheduled_at, scheduled_at + (duration_minutes || ' minutes')::interval) WITH &&
  )
  WHERE (status IN ('DRAFT', 'PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED', 'RESCHEDULED'));
