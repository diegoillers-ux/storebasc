> Documento histórico. No acredita el estado actual; consultar ../../PROJECT-STATE.md.

# QA End-to-End Checklist — AnandaStore V2
**Rama:** `main` (única rama oficial)
**Última actualización:** 12 de Agosto, 2026
**Ejecutado por:** QA Lead + Full-Stack Senior

---

> **Nota histórica:** la tabla siguiente corresponde al ciclo de evaluación original (25-jul) ejecutado en modo demo. Desde entonces la app opera **sin demo** (`NEXT_PUBLIC_DEMO_MODE="false"`) con datos reales en Supabase. Las validaciones vigentes están en la sección **"Validación 2026-08-12"** más abajo.

## Tabla de Evaluación E2E (ciclo original, modo demo — 25-jul)

| Caso | Pasos de Prueba | Resultado Esperado | Resultado | Notas |
| :--- | :--- | :--- | :---: | :--- |
| **I0.1** | Confirmar rama local y pull | Rama activa sin conflictos | **PASS** | Historial consolidado en `main` |
| **I0.2** | Instalación de dependencias `npm install` | Instalación limpia de paquetes | **PASS** | 609 paquetes instalados en `node_modules` |
| **I0.3** | Configurar `.env.local` | Variables de entorno cargadas | **PASS** | En el ciclo original con `NEXT_PUBLIC_DEMO_MODE=true`; hoy `"false"` |
| **I0.4** | Verificación de compilación `npm run build` | Compilación sin errores de TypeScript | **PASS** | 45 rutas estáticas y dinámicas compiladas |
| **I1.A** | NAVEGACIÓN Y CATÁLOGO DE SERVICIOS (`/servicios`) | Carga de cards con títulos, duraciones y precios | **PASS** | 5 servicios mock renderizados correctamente |
| **I1.B** | PASO 1 RESERVA: DATOS DEL CONSULTANTE (`/checkout/[serviceId]`) | Llenado de formulario natal y persistencia en `sessionStorage` | **PASS** | Clave `ananda_checkout_data` guardada adecuadamente |
| **I1.C** | PASO 2 RESERVA: AGENDAMIENTO Y SLOTS (`/checkout/[serviceId]/schedule`) | Visualización de 14 días laborales y franjas horarias | **PASS** | Horarios `09:00`, `10:30`, `14:00`, `15:30`, `17:00` desplegados |
| **I1.D** | PASO 3 RESERVA: PAGO MANUAL Y VOUCHER (`/checkout/[serviceId]/pay`) | Cuentas Nequi/Daviplata/Bancolombia visibles + subida de comprobante | **PASS** | `POST /api/bookings/create` retorna ID `BNK-DEMO-XXXX` y vista de éxito |
| **I1.E** | PASO 3 RESERVA: PAGO PASARELA (`NEXT_PUBLIC_PAYMENT_PROVIDER=mercadopago`) | Interfaz de pasarela Mercado Pago y simulación de webhook idempotente | **PASS** | Generación de initPoint e integración con MCP Server |
| **I1.F** | RESERVA: APROBACIÓN ADMIN (`/api/admin/approve-reserva`) | Cambio de estado, actualización de calendario y confirmación por mail | **PASS** | En modo demo `requireAdminSession()` otorga acceso para pruebas |
| **I2.A** | TIENDA: CATÁLOGO DE PRODUCTOS (`/tienda`) | Carga de productos con stock > 0 | **PASS** | 6 productos artesanales renderizados con badges de stock |
| **I2.B** | TIENDA: CARRITO Y DRAWER (`CartDrawer.tsx`) | `ProductCard` agrega al carrito y actualiza contador en header | **PASS** | Sincronización en tiempo real vía `CartContext` |
| **I2.C** | TIENDA: CHECKOUT DE PRODUCTO WIZARD (`/checkout/product`) | Wizard de 4 pasos (Resumen, Envío en Cali, Pago, Confirmación) | **PASS** | Navegación fluida con validaciones de formulario |
| **I2.D** | TIENDA: REGISTRO DE ORDEN Y STOCK (`/api/orders/create`) | Creación de orden `ORD-DEMO-XXXX` y descuento atómico de inventario | **PASS** | Transacción ejecutada vía `productRepository.adjustStock` |
| **I3.1** | LANDING PAGE Y NAVEGACIÓN PÚBLICA (`/`) | Hero místico, servicios destacados, tienda y CTAs WhatsApp | **PASS** | Todos los componentes de portada funcionando |
| **I3.2** | NAVEGACIÓN MÓVIL (RESPONSIVE HEADER) | Menú hamburguesa desplegable en pantallas pequeñas | **PASS** | Implementado drawer móvil en `PublicHeader.tsx` |
| **I4.1** | CRON DE LIMPIEZA (`/api/cron/cleanup`) | Endpoint de liberación de citas pendientes > 30 min | **PASS** | Endpoint protegido por `CRON_SECRET` o Bearer Token |
| **I4.2** | CONFIGURACIÓN VERCEL CRON (`vercel.json`) | Definición de tareas programadas en la plataforma | **PASS** | Configurado `"crons": [{"path": "/api/cron/cleanup", "schedule": "*/15 * * * *"}]` |
| **I5.1** | SMOKE ADMIN: DASHBOARD Y RUTAS DE GESTIÓN (`/admin/*`) | Acceso a Agenda, Clientes, Pagos y Productos | **PASS** | Middleware y rutas administrativas operativas |

---

## Validación 2026-08-12 — Flujo Real sin Demo (supersede el ciclo anterior)

**Contexto:** credenciales reales de Supabase, Google Calendar y SMTP; pago Mercado Pago en **sandbox** (las 2 ventas de prueba).

| Caso | Pasos de Prueba | Resultado Esperado | Resultado | Notas |
| :--- | :--- | :--- | :---: | :--- |
| **R1** | Reserva real `bk_1786574822106_u646d` → preferencia MP → pago aprobado (tarjeta test) | Booking `CONFIRMED`, payment `APPROVED` | **PASS** | $116.000 — Carta Natal, 2026-08-13 |
| **R2** | Webhook real MP → booking → email + evento calendario + link WhatsApp | Evento con `calendar_event_id`, email enviado, `whatsapp_link` generado | **PASS** | Reserva `bk_1786576015027_q3jps` — $85.000, Tarot, 2026-08-14 |
| **R3** | Freebusy en el calendario compartido | Franjas ocupadas visibles para las 2 citas | **PASS** | Calendario compartido con la Service Account (permiso edición) |
| **R4** | RLS hardening | 10 policies `service_role` + 4 lectura pública; sin acceso total anon/authenticated | **PASS** | Verificado vía `pg_policies` |
| **R5** | Login con contraseña real contra Supabase Auth | Autenticación solo por credenciales reales | **PASS** | Sin proveedor demo; `NEXT_PUBLIC_DEMO_MODE="false"` |
| **R6** | CRM sin simulación | Dashboard/reportes con estados vacíos y contexto; sin métricas falsas | **PASS** | Módulos sin backend (rifas, IA) responden vacío/501 |
| **R7** | Compilación post-cambios | `tsc --noEmit` + `next build` sin errores | **PASS** | Build 2026-08-12 |

**Pendientes de validación (hoja de ruta):** pago manual completo (comprobante → verificación admin), tienda E2E con MP, cron cleanup en Vercel, webhook con firma en producción (`MERCADOPAGO_WEBHOOK_SECRET`). Ver `docs/04-HOJA-RUTA-PILOTO.md`.
