-- ─────────────────────────────────────────────────────────────
-- Migración: Tabla `blocked_slots` (bloqueos puntuales de agenda)
-- PENDIENTE DE APLICAR (requiere acceso Supabase). Ver ficha
-- docs/TAREA-2026-10-16-disponibilidad-atomica.md
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.blocked_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_at > start_at)
);

CREATE INDEX IF NOT EXISTS idx_blocked_slots_range
  ON public.blocked_slots (start_at, end_at);

ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service Role Full Access Blocked Slots" ON public.blocked_slots;
CREATE POLICY "Service Role Full Access Blocked Slots"
  ON public.blocked_slots TO service_role USING (true) WITH CHECK (true);
