# Arquitectura actual de Storebasc

Actualizada: 2026-10-13. Describe código, no acredita integraciones remotas.

## Capas

| Capa | Ubicación / implementación |
|---|---|
| Framework | Next.js 16.3.0 según lockfile; React 19.2.3; TypeScript; Tailwind 4 |
| Público | `src/app/(public)/`: portada, tienda y servicios |
| Checkout | `src/app/checkout/`: servicios, productos y confirmación |
| Administración | `src/app/(admin)/admin/`: agenda, clientes, catálogo, pagos, pedidos, configuración |
| API | `src/app/api/`: reservas, pedidos, calendario, pagos, cron y administración |
| Datos | `src/lib/supabase/repositories/`, esquema SQL y migraciones en `src/lib/supabase/` |
| Autenticación | Supabase Auth + NextAuth; `auth.ts`, `auth.config.ts`, `adminAuth.ts`, `middleware.ts` |
| Pagos | `src/lib/payments/`: Mercado Pago, manual y carga privada de comprobantes |
| Calendario | `src/lib/calendar/` y `googleCalendar.ts` |
| Notificaciones | Nodemailer en `mailer.ts`; links de WhatsApp en `whatsapp.ts` |

## Flujos presentes en V2

- Reservas: datos de cliente → reserva → preferencia Mercado Pago o comprobante manual → procesamiento de pago → calendario/correo/WhatsApp.
- Pedidos: carrito → pedido → pago → aprobación/despacho; los descuentos de stock requieren validar idempotencia y concurrencia.
- Disponibilidad pública: `GET /api/calendar/free-busy`; integra proveedor Google, configuración semanal y reservas activas. `/api/availability` fue retirado en V2.
- Comprobantes: `@vercel/blob` privado con tipo declarado JPG/PNG/PDF y máximo 2 MB; requiere comprobar acceso autorizado a descarga y estados parciales tras fallos.
- CRM: V2 incorpora consulta/edición de cliente y ficha ampliada; pendiente comprobar permisos por rol y comportamiento con datos reales.

## Límites comprobados por lectura

- `availabilityRepository` conserva únicamente días activos; reconstruye horas 09:00–18:00 y duración 60. Bloqueos puntuales no están persistidos.
- `listActiveByDateRange` primero consulta reservas cuyo inicio cae en el rango; puede omitir solapes iniciados antes. Creación hace comprobación y escritura separadas, sin exclusión transaccional.
- El calendario usa operaciones de fecha dependientes del huso del proceso; requiere pruebas UTC/Bogotá y fallos del proveedor.
- `requireAdminSession` exige sesión administrativa, pero no define una matriz completa de capacidades por rol. El modo demo omite controles.
- Catálogos públicos devuelven ejemplos cuando faltan datos o falla Supabase. No confundirlos con datos productivos.
- Rifas y contenido IA tienen interfaces y respuestas sin backend completo; reportes/dashboard requieren agregaciones reales.
- Branding, textos, campos natales y defaults están acoplados a Ananda; todavía no existe Storebasc Core configurable.

No aplicar automáticamente el esquema/seed: comparar migraciones con la base de pruebas primero. RLS y credenciales remotas necesitan auditoría vigente.
