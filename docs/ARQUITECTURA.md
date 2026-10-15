# Arquitectura actual (código, no operación)

Next.js 16.4.1 (lockfile), React 19, TypeScript, Tailwind 4. Paquete aún
llamado `anandastore-v2` (renombre pendiente de decisión).

| Capa | Ubicación |
|---|---|
| Público | `src/app/(public)/`: portada, tienda, servicios |
| Checkout | `src/app/checkout/`: servicio, producto, rifa, éxito |
| Admin | `src/app/(admin)/admin/`: agenda, clientes, catálogo, pagos, pedidos, reportes, contenido, rifas, configuración |
| API | `src/app/api/`: reservas, pedidos, calendario, pagos, webhooks MP, cron, admin |
| Datos | `src/lib/supabase/repositories/`, `schema.sql`, migraciones |
| Auth | Supabase Auth + NextAuth (`auth.ts`, `auth.config.ts`, `adminAuth.ts`, `middleware.ts`) |
| Pagos | `src/lib/payments/`: Mercado Pago, manual, comprobantes (`@vercel/blob` privado, 2 MB, JPG/PNG/PDF) |
| Calendario | `src/lib/calendar/`, `googleCalendar.ts` |
| Notificaciones | Nodemailer (`mailer.ts`); enlaces WhatsApp (`whatsapp.ts`, sin envío) |
| Demo | `demoMode.ts` (bypass admin), `demoStore.ts` (memoria), `data.ts` (ejemplos) |

## Límites comprobados por lectura

- Disponibilidad: solo días activos; horas 09:00–18:00 reconstruidas; bloqueos
  puntuales no persistidos; `listActiveByDateRange` puede omitir solapes
  iniciados antes; creación sin transacción atómica; huso del proceso.
- `requireAdminSession` exige admin, sin matriz de capacidades; demo omite todo.
- Catálogos devuelven ejemplos sin Supabase. Rifas/IA: `501` sin backend.
  Dashboard/reportes: placeholders. Branding y defaults acoplados a Ananda:
  todavía no hay núcleo configurable.
- Nodemailer 10 vs peer NextAuth (`^7 || ^8`): funciona hoy, resolver explícito.
- `middleware` (convención obsoleta según Next) + CSP en `next.config.ts`;
  cron en `vercel.json` (08:00/09:00). No aplicar esquema/seed sin revisar destino.
