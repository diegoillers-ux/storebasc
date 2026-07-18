# Arquitectura AnandaStore V2 (Memoria Activa del Proyecto)

Este documento define las especificaciones técnicas, decisiones de arquitectura y la estructura de datos para asegurar la consistencia y la línea de desarrollo en futuras sesiones.

---

## 🏛️ Stack Tecnológico Definido

*   **Framework**: Next.js 16 (App Router, Turbopack)
*   **Compilador de Estilos**: Tailwind CSS v4 (con PostCSS)
*   **Base de Datos**: Google Cloud Firestore (NoSQL, Serverless)
*   **Capa de Acceso a Datos**: Patrón Repositorio en NodeJS utilizando `firebase-admin` para consultas del lado del servidor.
*   **Autenticación**: NextAuth v5 (Edge-compatible) integrado con Google OAuth 2.0.
*   **Integración de Calendario**: Google Calendar API mediante cuenta de servicio (`Google JWT` OAuth2).
*   **Notificaciones**: SMTP integrado (vía contraseñas de aplicación de Gmail) para confirmaciones automáticas.
*   **IA de Marketing**: Gemini API / Unsplash API para generación de creatividades promocionales.

---

## 📂 Estructura de Rutas y Páginas

```
src/app/
├── (admin)/admin/             # Panel administrativo protegido (CRM)
│   ├── agenda/                # Agenda diaria y reprogramación de citas
│   ├── clientes/              # Fichas natales y bitácora de consultantes
│   ├── catalogo/              # Gestión e inventario de productos artesanales
│   ├── pedidos/               # Gestión de despachos y pedidos físicos
│   ├── pagos/                 # Bandeja de conciliación de transferencias
│   ├── contenido/             # Generador de banners IA con presets
│   ├── rifas/                 # Panel de sorteos aleatorios transaccionales
│   ├── reportes/              # Dashboard de reportes financieros y KPIs
│   └── configuracion/         # Horarios semanales, servicios y SMTP
│
├── checkout/                  # Embudo comercial público para clientes
│   ├── [serviceId]/           # Reserva: Formulario de datos natales
│   │   ├── schedule/          # Reserva: Calendario (disponibilidad real)
│   │   └── pay/               # Reserva: Subida de comprobante de pago
│   ├── product/               # Tienda: Carrito y datos de envío
│   │   └── pay/               # Tienda: Subida de comprobante
│   └── raffle/                # Sorteo: Compra de boletos
│
├── (public)/                  # Páginas públicas generales
│   ├── page.tsx               # Landing page principal (pendiente de rediseño)
│   └── login/                 # Formulario de inicio de sesión seguro
│
└── api/                       # Endpoints del backend
    ├── admin/                 # APIs del panel (bookings, products, payments, etc.)
    └── calendar/              # APIs de consulta de franjas horarias libres
```

---

## 🗄️ Esquema de Datos (Colecciones Firestore)

### 1. `adminUsers` (Administradores)
*   `id`: Identificador único (document id).
*   `email`: Correo de acceso administrativo (Google OAuth).
*   `name`: Nombre completo del administrador.
*   `role`: `'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'READER'`.
*   `active`: Booleano (acceso al panel).
*   `createdAt` / `updatedAt`: Timestamps de auditoría.

### 2. `customers` (Fichas del CRM)
*   `email`: Correo electrónico del cliente.
*   `name`: Nombre completo.
*   `phone`: WhatsApp de contacto.
*   `birthDate` / `birthTime` / `birthPlace`: Datos natales para Carta Astral.
*   `notes`: Bitácora y notas del terapeuta.

### 3. `services` (Catálogo de Sesiones)
*   `name` / `slug`: Título e identificador de URL.
*   `duration`: Minutos de sesión.
*   `price`: Monto en COP.
*   `active`: Booleano de visibilidad.

### 4. `bookings` (Reservas Astrales)
*   `customerId`: Relación al cliente.
*   `serviceId`: Relación al servicio.
*   `date`: Fecha en formato ISO (`YYYY-MM-DD`).
*   `timeSlot`: Hora reservada (`HH:MM`).
*   `status`: `'PENDING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'CONFIRMED' | 'CANCELLED'`.
*   `calendarEventId`: ID del evento en Google Calendar para sincronización.

### 5. `payments` (Bandeja Contable)
*   `bookingId` / `orderId`: Asociación a cita o pedido de e-commerce.
*   `amount`: Valor transferido.
*   `status`: `'PENDING' | 'APPROVED' | 'REJECTED'`.
*   `voucherUrl`: URL pública de la captura del recibo.
*   `verifiedBy`: Admin que autorizó la conciliación.

### 6. `products` (Catálogo de Tienda)
*   `name` / `description`: Título y texto de venta.
*   `price`: Precio en COP.
*   `stock` / `minStock`: Control de inventario y alertas automáticas.
*   `imageUrl`: URL de la imagen del producto.
*   `active`: Booleano de venta.

### 7. `orders` (Pedidos E-commerce)
*   `customerId`: Relación al cliente.
*   `items`: Lista de `{ productId, quantity, price }`.
*   `total`: Valor final cobrado.
*   `status`: `'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED'`.
*   `shippingAddress`: Dirección de despacho.

---

## 🛠️ Condiciones Especiales de Desarrollo y Arquitectura

1.  **Principio de Aislamiento de Entorno (Bypass Mode)**:
    *   La función `isDemoMode()` en `src/lib/demoMode.ts` determina si la base de datos de Firestore y el calendario deben responder con datos ficticios o reales.
    *   **En local (Desarrollo)**: Si falta la firma del certificado Service Account (`GOOGLE_PRIVATE_KEY`), se activa el **Bypass**, cargando mock data para evitar caídas del servidor.
    *   **En Vercel (Producción)**: El bypass se autodesactiva para asegurar que todos los datos sean reales y que las redirecciones OAuth estén firmadas.
2.  **Transacciones ACID en Modificaciones de Stock**:
    *   Cualquier compra o ajuste manual de inventario ejecuta una transacción en Firestore a través de `productRepository.adjustStock()`, registrando un log histórico en la colección `stockMovements` y protegiendo la consistencia física del inventario.
3.  **Seguridad y Reglas**:
    *   El acceso a `/api/admin/*` está estrictamente blindado por el middleware `src/middleware.ts` y por validaciones dentro de cada ruta mediante la sesión del administrador (`requireAdminSession`).
