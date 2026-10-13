> Documento histórico. No acredita el estado actual; consultar ../../PROJECT-STATE.md.

# Reporte de Hallazgos y Correcciones de QA — AnandaStore V2
**Última actualización:** 12 de Agosto, 2026
**Proyecto:** AnandaStore V2
**Rama:** `main` (única rama oficial)

---

## Resumen de Vulnerabilidades & Defectos Detectados

| ID | Severidad | Descripción del Defecto | Archivo Afectado | Estado |
| :---: | :---: | :--- | :--- | :---: |
| **BUG-01** | **P1** | `isDemoMode()` no evaluaba la variable `NEXT_PUBLIC_DEMO_MODE=true` especificada en la convención Next.js del proyecto. | `src/lib/demoMode.ts` | **FIXED** |
| **BUG-02** | **P2** | Falta de mensaje de validación y botón de reinicio en `/checkout/[serviceId]/pay` si `sessionStorage` está vacío al ingresar directamente. | `src/app/checkout/[serviceId]/pay/page.tsx` | **FIXED** |
| **BUG-03** | **P1** | `vercel.json` contenía `"crons": []` vacío, impidiendo la ejecución programada de la limpieza de citas vencidas en Vercel. | `vercel.json` | **FIXED** |
| **BUG-04** | **P1** | `PublicHeader.tsx` no contaba con un menú hamburguesa desplegable para navegación móvil en pantallas menores a `md`. | `src/components/public/PublicHeader.tsx` | **FIXED** |
| **BUG-05** | **P1** | Incompatibilidad en payload de `/api/bookings/create` desde el botón de Mercado Pago en `pay/page.tsx`. | `src/app/checkout/[serviceId]/pay/page.tsx` | **FIXED** |
| **BUG-06** | **P2** | Descuento prematuro de stock de productos antes de la confirmación de pago en pasarela. | `src/app/api/orders/create/route.ts` | **FIXED** |
| **BUG-07** | **P2** | Falta de tareas cron para cancelar pedidos de productos abandonados tras 24 horas. | `src/app/api/cron/orders-cleanup/route.ts` | **FIXED** |
| **BUG-08** | **P1** | Inconsistencia en la estructura del manifest HMAC `id:${paymentId};ts` para firma de webhooks de Mercado Pago. | `src/lib/payments/mercadopago.ts` | **FIXED** |
| **BUG-09** | **P2** | Falta de propagación del tipo (`booking` | `order`) en redirección post-pago a `/checkout/success`. | `src/app/api/checkout/preference/route.ts` | **FIXED** |
| **BUG-10** | **P3** | Idempotencia parcial en webhooks que re-procesaba pagos no aprobados. | `src/app/api/webhooks/mercadopago/route.ts` | **FIXED** |
| **BUG-11** | **P3** | Dependencias residuales de `NEXT_PUBLIC_PAYMENT_MODE` en vistas de checkout. | `src/app/checkout/product/page.tsx` | **FIXED** |

---

## Detalles de los Fixes Aplicados

### 1. BUG-01 — Soporte Completo para `NEXT_PUBLIC_DEMO_MODE`
- **Diagnóstico:** `isDemoMode()` verificaba únicamente `process.env.DEMO_MODE` o `process.env.NEXT_PUBLIC_BYPASS_AUTH`.
- **Solución:** Se incluyó `process.env.NEXT_PUBLIC_DEMO_MODE === 'true'` en las condiciones principales.
- **Commit:** `fix(demo): incluir NEXT_PUBLIC_DEMO_MODE en isDemoMode()`

### 2. BUG-02 — Validación de Sesión de Reserva en Paso de Pago
- **Diagnóstico:** Si el cliente accedía directamente a `/pay` o su sesión se borraba, el botón de envío no mostraba retroalimentación de error.
- **Solución:** Se agregó validación explícita con mensaje descriptivo pidiendo al cliente regresar al Paso 1 para ingresar sus datos.
- **Commit:** `fix(checkout): validar checkoutData en paso de pago y mostrar alerta`

### 3. BUG-03 — Programación de Cron Job en Vercel
- **Diagnóstico:** El endpoint `/api/cron/cleanup` estaba construido pero no registrado en `vercel.json`.
- **Solución:** Se añadió la directiva de cron a `vercel.json` (`*/15 * * * *`).
- **Commit:** `fix(cron): configurar horario de limpieza programada en vercel.json`

### 4. BUG-04 — Menú Móvil Responsivo en Encabezado
- **Diagnóstico:** En dispositivos móviles, los enlaces a `/servicios` y `/tienda` no eran accesibles en el encabezado.
- **Solución:** Se incorporó el estado `mobileMenuOpen` y un menú desplegable responsivo.
- **Commit:** `fix(ui): agregar menú hamburguesa móvil en PublicHeader`

---

## Correcciones Posteriores — Ciclo de Revisión Mercado Pago (Agosto 2026)

| ID | Severidad | Descripción del Defecto | Archivo Afectado | Estado |
| :---: | :---: | :--- | :--- | :---: |
| **BUG-12** | **P1** | El CHECK de `orders.status` en la base de datos no admitía `PAYMENT_PENDING`, rompiendo la creación de órdenes de pasarela con stock diferido. | `src/lib/supabase/schema.sql` + `migrations/update_orders_status_check.sql` | **FIXED** |
| **BUG-13** | **P2** | La página `/checkout/success` ignoraba `?status=`, mostrando "éxito" también en pagos pendientes o fallidos. | `src/app/checkout/success/page.tsx` | **FIXED** |

### 12. BUG-12 — CHECK de `orders.status` sin `PAYMENT_PENDING`
- **Diagnóstico:** `orders/create` insertaba `PAYMENT_PENDING` (stock diferido en pasarela) pero el CHECK de la tabla solo admitía `('PENDING','PAID','SHIPPED','CANCELLED','DELIVERED')` → 500 en runtime.
- **Solución:** Se amplió el CHECK en `schema.sql` y se creó la migración `update_orders_status_check.sql` (aplicar en Supabase).

### 13. BUG-13 — Success page sin diferenciar estado del pago
- **Diagnóstico:** `back_urls` retornan `?status=approved|pending|failure` pero la página siempre mostraba confirmación de éxito.
- **Solución:** Se lee `status` y se varía título, mensaje e incluso CTA de "Reintentar pago" cuando la transacción falló.

---

## Correcciones — Ciclo de Validación Real (12 de Agosto, 2026)

| ID | Severidad | Descripción del Defecto | Archivo Afectado | Estado |
| :---: | :---: | :--- | :--- | :---: |
| **BUG-14** | **P1** | Las Service Accounts de Google sin Domain-Wide Delegation no pueden invitar asistentes: `createEvent`/`updateEvent` fallaban al insertar el asistente del cliente, rompiendo la confirmación de citas. | `src/lib/calendar/google.ts` | **FIXED** |
| **BUG-15** | **P2** | Las notas del cliente se "guardaban" con un POST que solo actualizaba el estado local en memoria — no persistían en Supabase. | `src/app/(admin)/admin/clientes/page.tsx` + `src/app/api/admin/customers/route.ts` | **FIXED** |
| **BUG-16** | **P2** | Dashboard y Reportes mostraban métricas, citas y alertas **simuladas** que inducían a error al operador (parecían datos reales). | `src/app/(admin)/admin/page.tsx`, `reportes/page.tsx` | **FIXED** |
| **BUG-17** | **P3** | Enlace roto `/admin/ventas` (404) y perfil hardcodeado en la barra lateral del panel. | `src/components/admin/AdminSidebar.tsx` | **FIXED** |

### 14. BUG-14 — Invitación de asistentes sin Domain-Wide Delegation
- **Diagnóstico:** La API de Google Calendar devuelve error 400/403 al intentar crear eventos con `attendees` cuando la Service Account no tiene DWD habilitado. Rompía el flujo completo de confirmación (webhook MP y verificación manual).
- **Solución:** Se agregó `isAttendeeForbiddenError()` y reintento automático del evento sin asistentes en `createEvent`/`updateEvent` (`src/lib/calendar/google.ts`).
- **Verificado:** Evento real creado vía webhook MP con `calendar_event_id` y freebusy correctos.

### 15. BUG-15 — Notas de cliente que no persistían
- **Diagnóstico:** `handleSaveNotes` usaba `POST` contra la colección de clientes y solo mutaba el estado local.
- **Solución:** Se agregó `PUT /api/admin/customers/:id` (update real vía repositorio) y la página ahora usa ese endpoint.

### 16. BUG-16 — Datos simulados en CRM/Dashboard
- **Diagnóstico:** El panel mostraba $2.450.000 de ingresos, 24 clientes, citas y alertas falsas, más una carga simulada de 800ms en reportes.
- **Solución:** Rediseño del dashboard y reportes con estados vacíos y textos de contexto; eliminados los arrays MOCK de 6 rutas API admin (las ramas demo devuelven `[]`); módulos sin backend responden 501/400 honestos.

### 17. BUG-17 — Sidebar con enlace roto y perfil falso
- **Diagnóstico:** `Ventas` apuntaba a una ruta inexistente (404) y el perfil mostraba "Rol: Administrador" fijo.
- **Solución:** Enlace eliminado y perfil ahora lee el rol y correo reales de la sesión (`useSession`).
