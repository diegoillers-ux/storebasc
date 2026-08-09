-- ====================================================================
-- Migración Consolidada: Campos, Restricciones CHECK y RLS para Supabase
-- ====================================================================

-- 1. Asegurar columnas faltantes en `bookings`
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS calendar_event_id TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_link TEXT;

-- Restricción CHECK de status en `bookings`
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('DRAFT', 'PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'));

-- 2. Asegurar columnas faltantes en `orders`
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS delivery JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Restricción CHECK de status en `orders`
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('NEW', 'PENDING', 'PAYMENT_PENDING', 'PAYMENT_SUBMITTED', 'PAID', 'PREPARING', 'READY', 'SHIPPED', 'CANCELLED', 'DELIVERED', 'REFUNDED'));

-- 3. Asegurar columnas faltantes y CHECK en `payments`
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS reference TEXT,
  ADD COLUMN IF NOT EXISTS provider_data JSONB,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check
  CHECK (status IN ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'VERIFIED', 'REFUNDED', 'CANCELLED'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference) WHERE reference IS NOT NULL;

-- 4. Asegurar columnas faltantes en `customers`
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS otp_code TEXT,
  ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- 5. Asegurar política de lectura pública para `ai_assets` (Rifas públicas)
DROP POLICY IF EXISTS "Permitir lectura pública de ai_assets raffles" ON public.ai_assets;
CREATE POLICY "Permitir lectura pública de ai_assets raffles" ON public.ai_assets FOR SELECT USING (type = 'raffle');
