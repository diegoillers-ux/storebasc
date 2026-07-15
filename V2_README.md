# AnandaStore V2 — Registro de Rediseño y Hitos Completados

Este archivo registra el progreso del rediseño, las decisiones de arquitectura de base y los hitos alcanzados para asegurar la coherencia en las sesiones posteriores del proyecto.

---

## 🏛️ Decisiones Clave de Arquitectura (Memoria del Proyecto)

1.  **Migración Serverless (Firebase)**:
    *   Reemplazamos Prisma ORM y PostgreSQL por **Cloud Firestore** como la base de datos central de la aplicación.
    *   Toda la interacción con la base de datos se realiza a través de repositorios locales (`src/lib/firebase/repositories/`) implementando consultas transaccionales atómicas y mapeadores seguros.
2.  **Manejo Dual: Modo Demo y Producción**:
    *   Para agilizar el desarrollo y las pruebas sin requerir la configuración de cuentas de servicio privadas en local, implementamos la función `isDemoMode()` (`src/lib/demoMode.ts`).
    *   Si se detecta que las variables de servicio no están cargadas o si `NEXT_PUBLIC_DEMO_MODE=true`, la API devuelve un flujo enriquecido de datos de prueba pre-cargados (mock data).
    *   En producción (Vercel), el bypass de autenticación se deshabilita para requerir inicio de sesión mediante Google OAuth 2.0 y consultas reales a Firestore.
3.  **Sistema de Estilos y Compilación**:
    *   Utilizamos **Tailwind CSS v4** mediante PostCSS (`postcss.config.mjs` con `@tailwindcss/postcss`) para asegurar la correcta compilación y precarga de los estilos premium y de diseño místico (constelaciones, gradientes, bordes fluidos) tanto en local como en producción.

---

## 🏆 Hitos Completados (Julio 2026)

*   **Fase A — Autenticación y Middleware** ✅:
    *   Configuración Edge de NextAuth v5.
    *   Middleware de redirección segura a `/login` basado en roles almacenados en la colección de `adminUsers` de Firestore.
*   **Fase B — Google Calendar & Disponibilidad** ✅:
    *   Proveedor de calendario de Google y API de cálculo de disponibilidad de franjas horarias descartando horas reservadas.
*   **Fase C — Agenda, Servicios y CRM de Clientes** ✅:
    *   Catálogo CRUD de servicios de lecturas.
    *   CRM de consultantes con datos astrales, notas e historial natal.
    *   Calendario administrativo mensual/semanal/diario.
*   **Fase D — Catálogo de Productos y Pedidos** ✅:
    *   Catálogo CRUD de productos físicos de la tienda.
    *   Alertas de stock (bajo inventario y agotado).
    *   Bitácora de movimientos de stock con transacciones transaccionales ACID.
    *   Gestor logístico de despachos de pedidos físicos.
*   **Fase E — Finanzas, Recibos y Conciliación** ✅:
    *   Auditoría de transferencias manuales (Nequi, Daviplata, Bancolombia).
    *   Visor zoom de comprobantes de pago.
    *   Aprobaciones en cascada que actualizan el pago, confirman la cita de reserva astral en Google Calendar y envían correos automáticos mediante SMTP.
*   **Fase F — Contenido IA, Sorteos y SMTP** ✅:
    *   Generador de banners de redes sociales mediante Gemini e Unsplash.
    *   Píldoras interactivas de formato (Historia 9:16, Post IG 1:1, Post FB 1.91:1).
    *   Preseteador de estilos místicos de Lina (Taller de Cuarzos, Magia Blanca, Portales, Alas).
    *   Módulo de Sorteos y Rifas astrales con sorteador aleatorio transaccional y confeti.
    *   Pestaña de personalización de correos SMTP.

---

## 🧭 Próximos Pasos (Fase G & H — En cola)

1.  **Rediseño de la Landing Page Comercial Pública (`/`)**:
    *   Rediseñar la portada con el sistema de tokens místico y Tailwind v4.
2.  **Construcción del Embudo de Reserva y Compra Público**:
    *   Flujo `/checkout/[serviceId]` para agendar fecha/hora consultando la disponibilidad real de Google Calendar.
    *   Página de reporte de pago para subir comprobantes.
    *   Carrito de compras para productos físicos `/checkout/product`.
