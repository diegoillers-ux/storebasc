# Arquitectura actual (código, no operación)

Next.js 16.4.1 (lockfile), React 19, TypeScript, Tailwind 4. Paquete aún
llamado `anandastore-v2` (renombre pendiente de decisión).

| Capa | Ubicación |
|---|---|
| Público | `src/app/(public)/`: portada, tienda, servicios |
| Checkout | `src/app/checkout/`: servicio, producto, éxito |
| Admin | `src/app/(admin)/admin/`: agenda, clientes, catálogo, pagos, pedidos, reportes, contenido, configuración |
| API | `src/app/api/`: reservas, pedidos, calendario, pagos, webhooks MP, cron, admin |
| Datos | `src/lib/supabase/`: `schema.sql`, `migrations/`, `repositories/` (+ `supabase/` vacía) |
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
- Catálogos devuelven ejemplos sin Supabase. IA contenido: `501` sin backend
  (rifas eliminadas por decisión del propietario, 2026-10-16).
  Dashboard/reportes: placeholders. Branding y defaults acoplados a Ananda:
  todavía no hay núcleo configurable.
- Nodemailer `^10.0.13` + NextAuth `^5.0.0-beta.32` (v5 beta): funciona hoy, resolver explícito.
- `src/middleware.ts` (convención obsoleta según Next) + CSP en `next.config.ts`;
  cron en `vercel.json` (`0 8 * * *`, `0 9 * * *`). No aplicar esquema/seed sin revisar destino.
