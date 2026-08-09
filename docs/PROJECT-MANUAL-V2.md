# Manual Técnico & Guía de Arquitectura V2 — Espíritu Ananda

**Proyecto:** AnandaStore V2  
**Rama Oficial Única:** `main`  
**Repositorio GitHub:** `diegoillers-ux/storebasc`  
**Estado:** Consolidado, estandarizado y listo para producción  

---

## 🏛️ 1. Arquitectura General del Sistema

**AnandaStore V2** es una aplicación Web Full-Stack desacoplada construida bajo los principios de arquitectura limpia sobre la infraestructura de Vercel y Supabase PostgreSQL.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTE / NAVEGADOR                           │
│  Landing Page (/) · Servicios (/servicios) · Tienda (/tienda) · Cart   │
│ Checkout Citas (/checkout/[serviceId]) · Checkout E-Commerce (/product) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (HTTP / JSON / Server Actions)
┌────────────────────────────────────▼────────────────────────────────────┐
│                    NEXT.JS 16 APP ROUTER (SERVIDORES)                   │
│                                                                         │
│  ┌───────────────────────┐ ┌──────────────────────┐ ┌─────────────────┐ │
│  │ Supabase Auth +       │ │ API Routes (Server)  │ │ Vercel Cron     │ │
│  │ NextAuth v5           │ │ /api/bookings/create │ │ /api/cron/clean │ │
│  │ Registro OTP & JWT    │ │ /api/orders/create   │ │ (expiraciones)  │ │
│  └───────────┬───────────┘ └──────────┬───────────┘ └────────┬────────┘ │
└──────────────┼────────────────────────┼──────────────────────┼──────────┘
               │                        │                      │
               │                        │                      │
┌──────────────▼────────────────────────▼──────────────────────▼──────────┐
│                             CAPA DE DATOS                               │
│                                                                         │
│   ┌───────────────────────────┐         ┌───────────────────────────┐   │
│   │   Supabase Client / Server│         │   Google Calendar SDK     │   │
│   │   (PostgreSQL Relacional) │         │   (Service Account RSA)   │   │
│   └───────────────────────────┘         └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛍️ 2. Flujos del Sistema & Reglas de Negocio

### A. Embudo de Reserva de Sesiones Astrales (3 Pasos)
1. **Paso 1 — Registro Natal (`/checkout/[serviceId]`)**:
   - Captura nombre completo, correo electrónico, WhatsApp de contacto, fecha de nacimiento y notas/intención de la sesión.
   - Guarda el estado transitorio en `sessionStorage` con clave `ananda_checkout_data`.
2. **Paso 2 — Selección de Fecha y Hora (`/checkout/[serviceId]/schedule`)**:
   - `AvailabilityCalendar.tsx` consulta las franjas horarias ocupadas mediante `/api/calendar/free-busy`.
   - Muestra días laborales (excluyendo domingos) y horarios disponibles (`09:00`, `10:30`, `14:00`, `15:30`, `17:00`).
3. **Paso 3 — Transferencia Manual / Pasarela (`/checkout/[serviceId]/pay`)**:
   - Muestra los datos de transferencia para Nequi, Daviplata y Bancolombia (o pasarela Mercado Pago en modo `mercadopago`).
   - Permite pago directo con tarjeta, Nequi, PSE o Efecty mediante Checkout Pro de Mercado Pago.
   - Consume `POST /api/bookings/create`: registra o actualiza el cliente en `customers` y crea la reserva en `bookings` con estado `PENDING_PAYMENT`.
   - Genera la preferencia mediante `/api/checkout/preference` y redirige al checkout seguro de Mercado Pago.

### B. Embudo de Tienda E-Commerce Holística (4 Pasos)
1. **Catálogo & Carrito (`/tienda` + `CartDrawer`)**:
   - Muestra tarjetas de producto con aspect-ratio cuadrado (`ProductCard.tsx`), badges de bajo stock (`< 5` unidades) y control de cantidad.
   - Sincroniza en tiempo real el carrito global mediante `CartContext` y `sessionStorage` (`ananda_cart`).
2. **Wizard de Despacho (`/checkout/product`)**:
   - **Paso 1**: Resumen de ítems y subtotal.
   - **Paso 2**: Formulario de envío (Dirección, barrio, ciudad Cali default e indicaciones).
   - **Paso 3**: Transferencia manual Nequi/Daviplata/Bancolombia + subida de comprobante.
   - **Paso 4**: Confirmación de pedido con número de orden `ORD-XXXX`.
3. **Transacción de Inventario (`/api/orders/create`)**:
   - Crea o actualiza el registro del cliente en Supabase.
   - Ejecuta descuento atómico de inventario en `products` utilizando `productRepository.adjustStock`.

### C. Panel Administrativo & Autenticación (`/admin/*`)
- **Autenticación Nativa**: Integrada mediante Supabase Auth + NextAuth v5.
- **Flujo de Registro & Verificación (`/register` y `/verify-otp`)**:
  - Registro de usuarios administradores con envío automático de correo transaccional Nodemailer conteniendo un **código de verificación OTP de 6 dígitos**.
  - Permite restablecimiento y cambio de contraseña sin depender de credenciales estáticas de Google OAuth.
- **Acceso Autorizado**: Valida permisos contra la tabla `admin_users` de Supabase o la lista blanca `ADMIN_EMAILS`.
- **Aprobaciones en Cascada (`/api/admin/approve-reserva`)**:
  - Actualiza el estado de la reserva o recibo a confirmado/pagado.
  - Remueve el prefijo `[PENDIENTE]` del evento en Google Calendar y cambia el color del evento.
  - Dispara el envío de correo de confirmación mediante SMTP (Nodemailer).

---

## 🗄️ 3. Modelo de Datos Relacional de Supabase (PostgreSQL)

| Tabla | Propósito | Campos Clave |
| :--- | :--- | :--- |
| **`customers`** | CRM de consultantes astrales | `id`, `name`, `email`, `phone`, `birth_date`, `notes`, `source`, `active` |
| **`services`** | Catálogo de lecturas astrales | `id`, `name`, `slug`, `duration`, `price`, `active`, `category` |
| **`products`** | Inventario e-commerce | `id`, `name`, `slug`, `price`, `stock`, `min_stock`, `image_url`, `category`, `active` |
| **`bookings`** | Citas astrales agendadas | `id`, `customer_id`, `service_id`, `scheduled_at`, `duration_minutes`, `status`, `calendar_event_id` |
| **`orders`** | Pedidos de productos físicos | `id`, `customer_id`, `subtotal`, `shipping`, `total`, `status`, `delivery`, `address` |
| **`payments`** | Recibos, vouchers y transacciones de pasarela | `id`, `customer_id`, `booking_id`, `order_id`, `amount`, `method`, `provider`, `reference`, `provider_data`, `status`, `voucher_url`, `verified_at`, `verified_by`, `created_at`, `updated_at` |
| **`admin_users`** | Administradores de la app | `id`, `email`, `name`, `role`, `active`, `created_at` |

---

## 🔧 4. Matriz Limpia de Variables de Entorno (.env.local / Vercel)

```env
# ─── Modo de Operación & Pasarela de Pagos ──────────────
NEXT_PUBLIC_DEMO_MODE="false"               # 'true' para preproducción, 'false' para producción
NEXT_PUBLIC_PAYMENT_PROVIDER="mercadopago"  # 'manual' | 'mercadopago'
NEXT_PUBLIC_APP_URL="https://storebasc.vercel.app"
NEXT_PUBLIC_APP_NAME="Espíritu Ananda"
NEXT_PUBLIC_WHATSAPP_NUMBER="573000000000"

# ─── Supabase (PostgreSQL & Auth) ─────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://abcdefgh.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# ─── Administradores ──────────────────────────────────────
ADMIN_EMAILS="lina@espiritananda.com,diegoillers@gmail.com"

# ─── Google Calendar & Agenda ──────────────────────────────
NEXT_PUBLIC_CALENDAR_ID="diegoillers@gmail.com"
GOOGLE_SERVICE_ACCOUNT_EMAIL="servicio-calendario@nexo-celestial.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# ─── Emailing SMTP / Nodemailer ────────────────────────────
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="diegoillers@gmail.com"
SMTP_PASSWORD="contrasena_de_aplicacion_gmail"
SMTP_FROM="Espíritu Ananda <no-reply@espiritananda.com>"

# ─── Cuentas Bancarias para Pago Manual ───────────────────
NEXT_PUBLIC_NEQUI_NUMBER="300 123 4567"
NEXT_PUBLIC_DAVIPLATA_NUMBER="300 123 4567"
NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT="Ahorros 123-456789-00"

# ─── Cron Job Security ────────────────────────────────────
CRON_SECRET="secreto_seguro_para_invocar_cron_cleanup"
```

---

## 🚀 5. Comandos Frecuentes

```bash
# Desarrollo Local
npm run dev

# Verificación de Tipo y Compilación
npm run build

# Poblar Base de Datos Supabase de Prueba
node seed-supabase.mjs

# Sincronización con Vercel
npx vercel env pull .env.local
```
