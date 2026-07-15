# Plan de sprints AnandaStore V2

## Sprint 1 — Foundation ✅ En curso
- [x] Crear rama `redesign/ananda-v2`
- [x] Estructura de carpetas App Router
- [x] Sistema de tipos TypeScript
- [x] Lib utils, db, whatsapp, payments, calendar
- [x] Tailwind paleta Ananda
- [x] Componentes UI base: Card, Button, Badge
- [x] Layout admin con sidebar índigo
- [x] Layout público con header y footer
- [x] Middleware de protección de rutas admin
- [x] Prisma schema completo
- [x] .env.example documentado
- [x] Documentación de arquitectura y sprint plan
- [ ] Instalar dependencias: prisma, clsx, tailwind-merge
- [ ] Configurar NextAuth v5
- [ ] Configurar PostgreSQL y correr primera migración
- [ ] Conectar preview de Vercel a esta rama

## Sprint 2 — Agenda y Clientes
- [ ] CRUD de servicios
- [ ] CRUD de clientes
- [ ] Disponibilidad y reglas de agenda
- [ ] Reservas: crear, confirmar, reprogramar, cancelar
- [ ] Integración Google Calendar (crear/actualizar/cancelar eventos)
- [ ] Estados de reserva y bitácora
- [ ] Vista agenda del día (admin)
- [ ] Enlace WhatsApp por reserva
- [ ] Bandeja de pagos manuales por verificar

## Sprint 3 — Pagos
- [ ] Flujo pago manual completo (instrucciones + comprobante)
- [ ] Subida de comprobante a almacenamiento
- [ ] Bandeja de verificación admin
- [ ] Webhook pasarela (Wompi placeholder listo)
- [ ] Confirmación automática al aprobar
- [ ] Pantallas de pago pendiente, aprobado y rechazado

## Sprint 4 — Tienda
- [ ] Catálogo con categorías y filtros
- [ ] Detalle de producto
- [ ] Carrito y checkout
- [ ] Pedidos y estados operativos
- [ ] Movimientos de inventario
- [ ] Notificaciones de pedido por WhatsApp/email

## Sprint 5 — Dashboard
- [ ] KPIs: sesiones, pagos, ingresos, clientes nuevos
- [ ] Agenda del día accionable
- [ ] Pendientes críticos
- [ ] Distribución de ingresos: servicios vs. tienda
- [ ] Accesos rápidos
- [ ] Reportes por periodo

## Sprint 6 — IA Comercial
- [ ] Generador de creatividades Gemini
- [ ] Formatos: story, post, banner, tarjeta
- [ ] Flujo de revisión y aprobación
- [ ] Biblioteca de assets aprobados
- [ ] Editor de texto sobre imagen

## Sprint 7 — Lanzamiento
- [ ] Migración de datos V1 → V2
- [ ] Pruebas end-to-end
- [ ] Optimización móvil
- [ ] Revisión de seguridad
- [ ] Merge a main + tag v2.0.0
- [ ] Actualizar Vercel a nueva rama
