-- ========================================================
-- ANANDASTORE V2 - SUPABASE POSTGRESQL DDL MIGRATION SCHEMA
-- ========================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: admin_users (Gestión de Administradores y Roles)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'READER')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABLA: customers (Consultantes y Compradores CRM)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    birth_date TEXT,
    notes TEXT,
    source TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABLA: services (Catálogo de Lecturas Astrales)
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    duration INT NOT NULL DEFAULT 60,
    price NUMERIC NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    category TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABLA: products (Inventario E-Commerce Holístico)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'COP',
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku TEXT,
    category TEXT,
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABLA: stock_movements (Kárdex de Movimientos de Inventario)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    change INT NOT NULL,
    reason TEXT NOT NULL,
    order_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TABLA: bookings (Citas Astrales Reservadas)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    service_id TEXT REFERENCES public.services(id) ON DELETE RESTRICT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    calendar_event_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. TABLA: orders (Pedidos E-Commerce de Productos)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    shipping NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED', 'DELIVERED')),
    delivery JSONB DEFAULT '{}'::jsonb,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. TABLA: payments (Comprobantes y Recibos de Pago)
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
    order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    voucher_url TEXT,
    verified_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. TABLA: availability_settings (Configuración de Agenda)
CREATE TABLE IF NOT EXISTS public.availability_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    work_days JSONB DEFAULT '[1,2,3,4,5,6]'::jsonb,
    time_slots JSONB DEFAULT '["09:00", "10:30", "14:00", "15:30", "17:00"]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. TABLA: ai_assets (Recursos y Copys de Inteligencia Artificial)
CREATE TABLE IF NOT EXISTS public.ai_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assets ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS predeterminadas (Lectura pública para catálogo/servicios; control total para Service Role)
CREATE POLICY "Permitir lectura pública de servicios activos" ON public.services FOR SELECT USING (active = true);
CREATE POLICY "Permitir lectura pública de productos activos" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Permitir lectura pública de configuracion agenda" ON public.availability_settings FOR SELECT USING (id = 'default');

-- Políticas para Service Role (API Backend Next.js)
CREATE POLICY "Service Role Full Access Admin Users" ON public.admin_users USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Customers" ON public.customers USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Services" ON public.services USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Products" ON public.products USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Stock Movements" ON public.stock_movements USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Bookings" ON public.bookings USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Orders" ON public.orders USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Payments" ON public.payments USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Availability" ON public.availability_settings USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access AI Assets" ON public.ai_assets USING (true) WITH CHECK (true);

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vouchers', 'vouchers', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;
