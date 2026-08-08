# Arquitectura AnandaStore V2 (Memoria Activa del Proyecto)

Este documento define las especificaciones técnicas, decisiones de arquitectura y la estructura de datos para asegurar la consistencia y la línea de desarrollo en futuras sesiones.

---

## 📌 CONTEXTO DEL PROYECTO

- **Repositorio**: `diegoillers-ux/storebasc`, rama: `main`
- **Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4 (vía PostCSS), Supabase (PostgreSQL Relacional & Auth), Google Calendar API, Nodemailer
- **Design Tokens** (en `src/app/globals.css`): Paleta `--color-ananda-*`, fuentes `--font-display` (Playfair Display) y `--font-sans` (Inter), clases UI `.glass-card`, `.glass-effect`
- **Colores Clave**: `ananda-950` (`#1A0F3D`), `ananda-900` (`#2D1B69`), `ananda-500` (`#7C3AED`), `ananda-400` (`#A78BFA`), `ananda-50` (`#FAF5FF`)
- **Repositorios Supabase Disponibles** (en `src/lib/supabase/repositories/`): `services.ts`, `products.ts`, `bookings.ts`, `payments.ts`, `customers.ts`, `availability.ts`, `admin-users.ts`
- **Helpers Disponibles**: `src/lib/whatsapp.ts`, `src/lib/mailer.ts`
- **Layout Público**: `src/app/(public)/layout.tsx` con `PublicHeader` y `PublicFooter` en `src/components/public/`
- **Modo Demo**: `src/lib/demoMode.ts` — si `isDemoMode()` retorna mock data para preproducción, en producción usa Supabase PostgreSQL real.

---

## 🏛️ Stack Tecnológico Definido

*   **Framework**: Next.js 16 (App Router, Turbopack)
*   **Compilador de Estilos**: Tailwind CSS v4 (con PostCSS)
*   **Base de Datos**: Supabase PostgreSQL (Relacional, Serverless SQL)
*   **Capa de Acceso a Datos**: Patrón Repositorio en NodeJS utilizando `@supabase/supabase-js` con `Service Role Key` para consultas del lado del servidor.
*   **Autenticación**: Supabase Auth Nativo + NextAuth v5 (Edge-compatible), registro de administradores con confirmación por correo electrónico y código OTP numérico de 6 dígitos.
*   **Integración de Calendario**: Google Calendar API mediante cuenta de servicio (`Google JWT` OAuth2).
*   **Notificaciones**: Nodemailer (SMTP) para confirmaciones automáticas de recibos, pedidos y envío de códigos de verificación.

---

## 📂 Estructura de Rutas y Páginas

```
src/app/
├── (admin)/admin/             # Panel administrativo protegido (CRM)
│   ├── agenda/                # Agenda diaria y reprogramación de citas
│   ├── clientes/              # Fichas natales y bitácora de consultantes
│   ├── catalogo/              # Gestión e inventario de productos artesanales
│   ├── pedidos/               # Gestión de despachos y pedidos físicos
│   ├── pagos/                 # Bandeja de conciliación de transferencias
│   ├── contenido/             # Generador de banners IA con presets
│   ├── rifas/                 # Panel de sorteos aleatorios transaccionales
│   ├── reportes/              # Dashboard de reportes financieros y KPIs
│   └── configuracion/         # Horarios semanales, servicios y SMTP
│
├── checkout/                  # Embudo comercial público para clientes
│   ├── [serviceId]/           # Reserva: Formulario de datos natales
│   │   ├── schedule/          # Reserva: Calendario (disponibilidad real)
│   │   └── pay/               # Reserva: Subida de comprobante de pago
│   ├── product/               # Tienda: Carrito y datos de envío
│   │   └── pay/               # Tienda: Subida de comprobante
│   └── raffle/                # Sorteo: Compra de boletos
│
├── (public)/                  # Páginas públicas generales
│   ├── page.tsx               # Landing page principal
│   ├── login/                 # Formulario de inicio de sesión seguro
│   ├── register/              # Registro de administradores
│   ├── verify-otp/            # Verificación de código OTP de 6 dígitos
│   ├── forgot-password/       # Solicitud de recuperación de contraseña
│   └── reset-password/        # Reestablecimiento de clave
│
└── api/                       # Endpoints del backend
    ├── admin/                 # APIs del panel (bookings, products, payments, etc.)
    └── calendar/              # APIs de consulta de franjas horarias libres
```

---

## 🗄️ Esquema de Datos (Tablas Supabase PostgreSQL)

### 1. `admin_users` (Administradores)
*   `id`: UUID o identificador primario.
*   `email`: Correo de acceso administrativo.
*   `name`: Nombre completo del administrador.
*   `role`: `'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'READER'`.
*   `active`: Booleano (acceso habilitado al panel).
*   `created_at` / `updated_at`: Timestamps de auditoría.

### 2. `customers` (Fichas del CRM)
*   `id`: UUID de la ficha de cliente.
*   `email`: Correo electrónico del cliente.
*   `name`: Nombre completo.
*   `phone`: WhatsApp de contacto.
*   `birth_date` / `birth_time` / `birth_place`: Datos natales para Carta Astral.
*   `notes`: Bitácora y notas del terapeuta.

### 3. `services` (Catálogo de Sesiones)
*   `id`: UUID del servicio.
*   `name` / `slug`: Título e identificador de URL.
*   `duration`: Minutos de sesión.
*   `price`: Monto en COP.
*   `active`: Booleano de visibilidad.

### 4. `bookings` (Reservas Astrales)
*   `id`: UUID de la cita.
*   `customer_id`: Relación a la tabla `customers`.
*   `service_id`: Relación a la tabla `services`.
*   `scheduled_at`: Fecha y hora timestamptz.
*   `status`: `'PENDING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'CONFIRMED' | 'CANCELLED'`.
*   `calendar_event_id`: ID del evento en Google Calendar para sincronización.

### 5. `payments` (Bandeja Contable)
*   `id`: UUID del pago.
*   `booking_id` / `order_id`: Asociación a cita o pedido de e-commerce.
*   `amount`: Valor transferido.
*   `status`: `'PENDING' | 'APPROVED' | 'REJECTED'`.
*   `voucher_url`: URL pública de la captura del recibo.
*   `verified_by`: Admin que autorizó la conciliación.

### 6. `products` (Catálogo de Tienda)
*   `id`: UUID del producto.
*   `name` / `description`: Título y texto de venta.
*   `price`: Precio en COP.
*   `stock` / `min_stock`: Control de inventario.
*   `image_url`: URL de la imagen del producto.
*   `active`: Booleano de venta.

### 7. `orders` (Pedidos E-commerce)
*   `id`: UUID de la orden.
*   `customer_id`: Relación a la tabla `customers`.
*   `items`: JSON / Relación de productos y cantidades.
*   `total`: Valor final cobrado.
*   `status`: `'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED'`.
*   `shipping_address`: Dirección de despacho.
