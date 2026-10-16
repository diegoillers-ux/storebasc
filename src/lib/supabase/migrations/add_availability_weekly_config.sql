-- ─────────────────────────────────────────────────────────────
-- Migración: Configuración semanal de agenda en `availability_settings`
-- PENDIENTE DE APLICAR (requiere acceso Supabase). Ver ficha
-- docs/TAREA-2026-10-16-disponibilidad-atomica.md
-- ─────────────────────────────────────────────────────────────
-- Guarda horas por día (las que ya edita el panel admin) en vez de
-- reconstruir 09:00–18:00 fijos. Compatible: el código lee `weekly` si
-- existe y retrocede a `work_days` si no.

ALTER TABLE public.availability_settings
  ADD COLUMN IF NOT EXISTS weekly JSONB DEFAULT NULL;

-- Relleno inicial desde `work_days` heredado (09:00–18:00, 60 min, activos)
UPDATE public.availability_settings
SET weekly = (
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'dayOfWeek', day::int,
    'startTime', '09:00',
    'endTime', '18:00',
    'slotMinutes', 60,
    'active', true
  ) ORDER BY day::int), '[]'::jsonb)
  FROM jsonb_array_elements_text(COALESCE(work_days, '[1,2,3,4,5,6]'::jsonb)) AS day
)
WHERE id = 'default' AND weekly IS NULL;
