-- ─────────────────────────────────────────────────────────────
-- Migración: Campos para Pasarelas de Pago en la Tabla `payments`
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS reference TEXT,
  ADD COLUMN IF NOT EXISTS provider_data JSONB,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Actualizar restricción CHECK en status para admitir pasarelas online
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check
  CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED', 'APPROVED', 'SUBMITTED', 'REFUNDED', 'CANCELLED'));

-- Índice único en la referencia para garantizar idempotencia en webhooks
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference) WHERE reference IS NOT NULL;
