-- ─────────────────────────────────────────────────────────────
-- Migración: Guardia antisolape atómica en `bookings`
-- PENDIENTE DE APLICAR (requiere acceso Supabase). Ver ficha
-- docs/TAREA-2026-10-16-disponibilidad-atomica.md
-- ─────────────────────────────────────────────────────────────
-- Convierte la carrera check-then-insert de `bookings/create` en un 409
-- garantizado por la BD: dos inserciones concurrentes del mismo rango no
-- pueden prosperar. El código mapea 23P01/23505 a 409.
-- Diseño: `timestamptz + interval` es STABLE y Postgres exige IMMUTABLE en
-- índices, por eso el fin del rango vive en la columna `ends_at`
-- (mantenida por trigger) y la exclusión usa solo columnas.
-- NOTA: si existen solapes activos previos, esta migración falla hasta
-- limpiarlos (consultar reservas duplicadas antes de aplicar).

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;

UPDATE public.bookings
SET ends_at = scheduled_at + make_interval(mins => duration_minutes)
WHERE ends_at IS NULL;

DROP FUNCTION IF EXISTS public.set_booking_ends_at() CASCADE;

CREATE FUNCTION public.set_booking_ends_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.ends_at := NEW.scheduled_at + make_interval(mins => COALESCE(NEW.duration_minutes, 60));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookings_ends_at ON public.bookings;

CREATE TRIGGER trg_bookings_ends_at
  BEFORE INSERT OR UPDATE OF scheduled_at, duration_minutes ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_booking_ends_at();

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_no_overlap_active;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_overlap_active
  EXCLUDE USING gist (
    tstzrange(scheduled_at, ends_at) WITH &&
  )
  WHERE (status IN ('DRAFT', 'PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED', 'RESCHEDULED'));
