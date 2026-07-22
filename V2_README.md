# AnandaStore V2 — Registro de Rediseño y Hitos Completados

Este archivo registra el progreso del rediseño, las decisiones de arquitectura de base y los hitos alcanzados para asegurar la coherencia en las sesiones posteriores del proyecto.

---

## 📌 CONTEXTO DEL PROYECTO

- **Repositorio**: `diegoillers-ux/storebasc`, rama: `redesign/ananda-v2`
- **Stack**: Next.js (App Router), TypeScript, Tailwind CSS v4 (vía PostCSS), Firebase Firestore (Admin SDK en server, Client SDK en browser)
- **Design Tokens** (en `src/app/globals.css`): Paleta `--color-ananda-*`, fuentes `--font-display` (Playfair Display) y `--font-sans` (Inter), clases UI `.glass-card`, `.glass-effect`, sombra `--shadow-premium`
- **Colores Clave**: `ananda-950` (`#1A0F3D`), `ananda-900` (`#2D1B69`), `ananda-500` (`#7C3AED`), `ananda-400` (`#A78BFA`), `ananda-50` (`#FAF5FF`)
- **Repositorios Firebase Disponibles** (en `src/lib/firebase/repositories/`): `services.ts`, `products.ts`, `bookings.ts`, `payments.ts`, `customers.ts`, `availability.ts`
- **Helpers Disponibles**: `src/lib/whatsapp.ts` (`getGeneralContactLink`, `getServiceBookingLink`), `src/lib/payments/index.ts` + `wompi.ts` + `manual.ts`
- **Layout Público**: `src/app/(public)/layout.tsx` con `PublicHeader` y `PublicFooter` en `src/components/public/`
- **Modo Demo**: `src/lib/demoMode.ts` — si `isDemoMode()` retorna mock data, en producción usa Firestore real
- **REGLAS**: NO usar Prisma ni PostgreSQL. NO crear rutas protegidas con NextAuth para el flujo público.

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
*   **Fase G — Portada Pública, Catálogo y E-Commerce** ✅:
    *   Rediseño completo de la Landing Page comercial pública (`/`) con 6 secciones místicas (Hero cosmico con estrellas SVG, Servicios destacados, Tienda destacada, Sobre Lina con acento dorado, Testimonios y CTA WhatsApp).
    *   Catálogo público de lecturas astrales (`/servicios`) con filtros interactivos por categoría (`useState`) y skeleton loader (`loading.tsx`).
    *   Tienda holística de productos (`/tienda`), tarjetas con aspect-ratio cuadrado (`ProductCard.tsx`), gestión global de carrito (`CartContext.tsx`), panel lateral deslizante (`CartDrawer.tsx`) y contador dinámico en `PublicHeader.tsx`.
*   **Fase H — Embudos Públicos de Checkout y Confirmación** ✅:
    *   Embudo de Reserva de Sesiones Astrales en 3 Pasos: Datos natales del consultante (`/checkout/[serviceId]`), Selector de fecha y horas disponibles (`/checkout/[serviceId]/schedule` con `AvailabilityCalendar.tsx`), y Pago/Subida de recibos manuales o Gateway (`/checkout/[serviceId]/pay`).
    *   Checkout de E-commerce de Productos Físicos (`/checkout/product`): Wizard de 4 pasos (Resumen de carrito, Datos de entrega y ciudad, Pago manual/pasarela Wompi y Confirmación).
    *   API Routes backend: `/api/bookings/create` (creación de cita y cliente), `/api/orders/create` (creación de orden y ajuste atómico de inventario en Firestore) y `/api/webhooks/wompi`.
    *   Página de Confirmación Unificada (`/checkout/success`): Resumen dinámico para citas o pedidos con animaciones CSS de estrellas y confeti místico.

---

## 🧭 Próximos Pasos (Fase I — Lanzamiento & Estabilización)

1. **Pruebas End-to-End (E2E)** de flujos cliente-administrador en vivo.
2. **Optimización de Rendimiento Móvil y PWA**.
3. **Auditoría de Seguridad** (Reglas de Firestore y Edge Middleware).
4. **Merge de `redesign/ananda-v2` a `main`**.
