-- ─────────────────────────────────────────────────────────────
-- Migración: Ampliar CHECK de status en la tabla `orders`
-- Permite el estado PAYMENT_PENDING (órdenes de pasarela con
-- stock diferido hasta la aprobación del pago).
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('PENDING', 'PAYMENT_PENDING', 'PAID', 'SHIPPED', 'CANCELLED', 'DELIVERED'));
