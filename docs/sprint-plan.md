# Plan de Sprints y Hoja de Ruta — AnandaStore V2

Este plan detalla los hitos completados y los entregables pendientes del rediseño para mantener sincronizado el avance del proyecto.

---

## Hito 1: Cimiento de Autenticación y Base de Datos (Sprint 1) ✅ Completado
- [x] Rama base unificada `redesign/ananda-v2`.
- [x] Estructuración del ruteo Next.js (App Router) y sistema de tipos estático.
- [x] Conexión e integración con Firebase SDK (Clientes y Administradores).
- [x] Migración del esquema a colecciones seguras de Firestore (`adminUsers`, `customers`, `bookings`, `payments`, `products`, `orders`).
- [x] Middleware Edge-Safe de NextAuth v5 para rutas administrativas.

## Hito 2: Agenda Mística y Google Calendar (Sprint 2) ✅ Completado
- [x] CRUD completo de catálogo de servicios.
- [x] Sistema de cálculo de disponibilidad de franjas horarias libres.
- [x] Integración de sincronización transaccional con Google Calendar API (creación de eventos por cuenta de servicio).
- [x] Flujos y vistas de la Agenda diaria para el administrador.
- [x] Conectores de WhatsApp CRM para iniciar chats de seguimiento.

## Hito 3: Finanzas y Aprobación de Pagos (Sprint 3) ✅ Completado
- [x] Registro contable de transferencias manuales (Nequi, Daviplata, Bancolombia).
- [x] Visor interactivo y zoom de comprobantes de pago adjuntos por el cliente.
- [x] Lógica de **Aprobación en Cascada**: aprobar un pago confirma automáticamente la cita en Google Calendar y cambia el estado de bookings/orders.
- [x] Panel de reportes de rentabilidad y ticket medio.

## Hito 4: Marketing con IA y Sorteos (Sprint 6) ✅ Completado
- [x] Generador de banners comerciales optimizado para redes sociales.
- [x] Selector de relación de aspecto de imagen (Historia 9:16, Post 1:1, Post FB 1.91:1).
- [x] Ajuste instantáneo de prompts a la identidad de Lina (Cuarzos, Magia Blanca, Portales).
- [x] Sistema de aprobación/rechazo reactivo de assets con badges.
- [x] Panel de sorteos y rifas astrales con sorteador aleatorio transaccional en caliente.
- [x] Plantillas dinámicas de correos SMTP en ajustes.

---

## Hito 5: Tienda Comercial y Embudos Públicos (Sprint 4) ✅ Completado
- [x] **Landing Page Pública (`/`)**:
  - Rediseñada con Tailwind v4, hero cósmico, 6 secciones completas y conexión a servicios y productos reales de Firestore.
- [x] **Catálogo de Servicios (`/servicios`)**:
  - Rejilla responsive, componentes `ServiceCard.tsx`, `loading.tsx` y filtros interactivos por categoría client-side.
- [x] **Tienda de Productos (`/tienda`)**:
  - Rejilla de productos con `ProductCard.tsx`, gestión global de carrito (`CartContext.tsx`), panel lateral `CartDrawer.tsx` y sincronización con `sessionStorage`.
- [x] **Embudo de Checkout de Servicios (`/checkout/[serviceId]`)**:
  - Formulario de datos natales y WhatsApp del consultante.
  - Componente `AvailabilityCalendar.tsx` de agendamiento de fecha y hora.
  - Paso final de pago manual (subida de comprobante base64) o gateway (Wompi).
  - API Routes `/api/bookings/create` y `/api/webhooks/wompi`.
- [x] **Checkout de Productos Físicos (`/checkout/product`)**:
  - Wizard de 4 pasos (Resumen de carrito, Datos de envío, Pago y Confirmación).
  - API Route `/api/orders/create` con transacciones de ajuste de stock en Firestore.
- [x] **Página de Confirmación Unificada (`/checkout/success`)**:
  - Vista adaptativa para citas o pedidos con animaciones CSS de estrellas y confeti místico.

---

## Hito 6: Lanzamiento y Estabilización (Sprint 7) 🧭 En Progreso
- [ ] Pruebas end-to-end (E2E) de flujos clientes-administrador en vivo.
- [ ] Optimización de rendimiento móvil.
- [ ] Auditoría de seguridad (Reglas de Firestore y NextAuth).
- [ ] Merge de `redesign/ananda-v2` a `main`.
