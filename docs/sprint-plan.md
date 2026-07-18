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

## Hito 5: Tienda Comercial y Embudos Públicos (Sprint 4) 🧭 Pendiente
Este es el siguiente sprint en la hoja de ruta. Las siguientes piezas no se han conectado a los repositorios reales de Firestore:
- [ ] **Landing Page Pública (`/`)**:
  - Rediseñar el inicio con Tailwind v4 y cargar los servicios y productos directamente de la base de datos de Firestore en lugar de los mocks estáticos.
- [ ] **Embudo de Checkout de Servicios (`/checkout/[serviceId]`)**:
  - Validar formulario de datos natales.
  - Conectar el selector de calendario a la API de disponibilidad en vivo.
  - Habilitar subida de comprobantes en el paso final de pago.
- [ ] **Carrito de Compras de Productos (`/checkout/product`)**:
  - Suma de ítems en memoria local.
  - Formulario de despacho y subida del recibo de pago manual.
- [ ] **Compra de Números de Rifa (`/checkout/raffle`)**:
  - Selección de número libre y subida de comprobante.

## Hito 6: Lanzamiento y Estabilización (Sprint 7) 🧭 Pendiente
- [ ] Pruebas end-to-end (E2E) de flujos clientes-administrador en vivo.
- [ ] Optimización de rendimiento móvil.
- [ ] Auditoría de seguridad (Reglas de Firestore y NextAuth).
- [ ] Merge de `redesign/ananda-v2` a `main`.
