# Arquitectura actual (código, no operación)

Next.js 16.4.1 (lockfile), React 19, TypeScript, Tailwind 4. Paquete aún
llamado `anandastore-v2` (renombre pendiente de decisión).

| Capa | Ubicación |
|---|---|
| Público | `src/app/(public)/`: portada, tienda, servicios |
| Checkout | `src/app/checkout/`: servicio (`[serviceId]` + `schedule` + `pay`), producto (`product` + `pay`), `success` |
| Admin | `src/app/(admin)/admin/`: `agenda`, `clientes`, `catalogo`, `pagos`, `pedidos`, `contenido`, `reportes`, `configuracion` (+ `page.tsx` panel) |
| API | `src/app/api/`: `auth/[...nextauth]`, `settings`, `checkout`, `checkout/preference`, `orders/create`, `bookings/create`, `calendar/` (free-busy, create-pending, report-payment), `webhooks/mercadopago`, `cron/` (cleanup, orders-cleanup), `admin/` (services, products, orders, bookings, customers, payments, calendar, settings, reservas, approve-reserva, content/generate) |
| Datos | `src/lib/supabase/`: `schema.sql`, `migrations/` (5), `repositories/` (9). `supabase/` en raíz solo guarda `.temp/` (metadata CLI), sin esquema |
| Auth | Supabase Auth + NextAuth v5 beta (`src/lib/auth.ts`, `src/lib/auth.config.ts`, `src/lib/adminAuth.ts`, `src/middleware.ts`) |
| Pagos | `src/lib/payments/`: Mercado Pago, manual, comprobantes (`@vercel/blob` privado, 2 MB, JPG/PNG/PDF) |
| Calendario | `src/lib/calendar/` + `src/lib/googleCalendar.ts` |
| Notificaciones | Nodemailer (`src/lib/mailer.ts`); enlaces WhatsApp (`src/lib/whatsapp.ts`, sin envío) |
| Demo | `src/lib/demoMode.ts` (bypass admin), `src/lib/demoStore.ts` (memoria), `src/lib/data.ts` (ejemplos) |

## Límites comprobados por lectura

- Disponibilidad: solo días activos; horas 09:00–18:00 reconstruidas; bloqueos
  puntuales no persistidos; `listActiveByDateRange` puede omitir solapes
  iniciados antes; creación sin transacción atómica; huso del proceso.
- `requireAdminSession` exige admin, sin matriz de capacidades; demo omite todo.
- Tienda/servicios intentan Supabase (`productRepository`/`services`) y caen a
  ejemplos (`MOCK_*` en página) si demo, vacío o error: ver tarjetas no demuestra conexión.
- IA contenido: `/admin/contenido` existe; GET devuelve `assets: []`, POST
  `501` (`content/generate/route.ts:24`, TODO Gemini), PUT `400`. Visible en
  sidebar aunque sin backend (criterio RUTA P1: ocultarla).
- Dashboard (`/admin`) y reportes (`/admin/reportes`): UI estática con `—` /
  "Sin datos suficientes", sin fetch a métricas. Branding y defaults acoplados a Ananda:
  todavía no hay núcleo configurable.
- Nodemailer `^10.0.13` + NextAuth `^5.0.0-beta.32` (v5 beta): funciona hoy, resolver explícito.
- `src/middleware.ts` (matcher solo `/admin/:path*`, bypass demo) + CSP y demás
  headers en `next.config.ts`;
  cron en `vercel.json` (`/api/cron/cleanup` `0 8 * * *`,
  `/api/cron/orders-cleanup` `0 9 * * *`). Convención de ubicación del
  middleware pendiente de confirmar contra la guía de Next 16. No aplicar esquema/seed sin revisar destino.
