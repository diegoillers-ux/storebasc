-- ─────────────────────────────────────────────────────────────
-- Migración: Descuento de stock atómico (`adjust_product_stock`)
-- PENDIENTE DE APLICAR (requiere acceso Supabase). Ver ficha
-- docs/TAREA-2026-10-16-pagos-pedidos-idempotencia.md
-- ─────────────────────────────────────────────────────────────
-- `adjustStock` era leer-modificar-escribir (carrera → sobreventa).
-- La función bloquea la fila, valida piso y registra el kárdex en la misma
-- transacción. `products.stock` ya tiene CHECK (stock >= 0) como red.

CREATE OR REPLACE FUNCTION public.adjust_product_stock(
  p_product_id TEXT,
  p_change INT,
  p_reason TEXT,
  p_order_id TEXT DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_stock INT;
BEGIN
  SELECT stock INTO v_stock FROM public.products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto % no encontrado', p_product_id;
  END IF;
  IF v_stock + p_change < 0 THEN
    RAISE EXCEPTION 'Stock insuficiente para el producto %', p_product_id;
  END IF;
  UPDATE public.products
  SET stock = v_stock + p_change, updated_at = now()
  WHERE id = p_product_id;
  INSERT INTO public.stock_movements (product_id, change, reason, order_id)
  VALUES (p_product_id, p_change, p_reason, p_order_id);
  RETURN v_stock + p_change;
END;
$$;
