# Manual Técnico & Guía de Arquitectura V2 — Espíritu Ananda

**Proyecto:** AnandaStore V2  
**Rama Oficial Única:** `main`  
**Repositorio GitHub:** `diegoillers-ux/storebasc`  
**Estado:** Consolidado, estandarizado y listo para producción  

---

## 🏛️ 1. Arquitectura General del Sistema

**AnandaStore V2** es una aplicación Web Full-Stack desacoplada construida bajo los principios de arquitectura limpia y serverless sobre la infraestructura de Vercel y Google Cloud.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTE / NAVEGADOR                           │
│  Landing Page (/) · Servicios (/servicios) · Tienda (/tienda) · Cart   │
│ Checkout Citas (/checkout/[serviceId]) · Checkout E-Commerce (/product) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (HTTP / JSON / Server Actions)
┌────────────────────────────────────▼────────────────────────────────────┐
│                    NEXT.JS 16 APP ROUTER (SERVIDORES)                   │
│                                                                         │
│  ┌───────────────────────┐ ┌──────────────────────┐ ┌─────────────────┐ │
│  │   NextAuth v5 (Edge)  │ │ API Routes (Server)  │ │ Vercel Cron     │ │
│  │   Google OAuth 2.0    │ │ /api/bookings/create │ │ /api/cron/clean │ │
│  │   JWT & Admin Middleware │ /api/orders/create   │ │ (expiraciones)  │ │
│  └───────────┬───────────┘ └──────────┬───────────┘ └────────┬────────┘ │
└──────────────┼────────────────────────┼──────────────────────┼──────────┘
               │                        │                      │
               │                        │                      │
┌──────────────▼────────────────────────▼──────────────────────▼──────────┐
│                             CAPA DE DATOS                               │
│                                                                         │
│   ┌───────────────────────────┐         ┌───────────────────────────┐   │
│   │   Firebase Admin SDK      │         │   Google Calendar SDK     │   │
│   │   (Cloud Firestore NoSQL) │         │   (Service Account RSA)   │   │
│   └───────────────────────────┘         └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛍️ 2. Flujos del Sistema & Reglas de Negocio

### A. Embudo de Reserva de Sesiones Astrales (3 Pasos)
1. **Paso 1 — Registro Natal (`/checkout/[serviceId]`)**:
   - Captura nombre completo, correo electrónico, WhatsApp de contacto, fecha de nacimiento y notas/intención de la sesión.
   - Guarda el estado transitorio en `sessionStorage` con clave `ananda_checkout_data`.
2. **Paso 2 — Selección de Fecha y Hora (`/checkout/[serviceId]/schedule`)**:
   - `AvailabilityCalendar.tsx` consulta las franjas horarias ocupadas mediante `/api/calendar/free-busy`.
   - Muestra días laborales (excluyendo domingos) y horarios disponibles (`09:00`, `10:30`, `14:00`, `15:30`, `17:00`).
3. **Paso 3 — Transferencia Manual / Pasarela (`/checkout/[serviceId]/pay`)**:
   - Muestra los datos de transferencia para Nequi, Daviplata y Bancolombia (o pasarela Wompi en modo `gateway`).
   - Requiere adjuntar el voucher en formato imagen o PDF (`FileReader` a Base64).
   - Consume `POST /api/bookings/create`: registra o actualiza el cliente en `customers` y crea la reserva en `bookings` con estado `PENDING_PAYMENT`.
   - Limpia `sessionStorage` y renderiza la pantalla de confirmación.

### B. Embudo de Tienda E-Commerce Holística (4 Pasos)
1. **Catálogo & Carrito (`/tienda` + `CartDrawer`)**:
   - Muestra tarjetas de producto con aspect-ratio cuadrado (`ProductCard.tsx`), badges de bajo stock (`< 5` unidades) y control de cantidad.
   - Sincroniza en tiempo real el carrito global mediante `CartContext` y `sessionStorage` (`ananda_cart`).
2. **Wizard de Despacho (`/checkout/product`)**:
   - **Paso 1**: Resumen de ítems y subtotal.
   - **Paso 2**: Formulario de envío (Dirección, barrio, ciudad Cali default e indicaciones).
   - **Paso 3**: Transferencia manual Nequi/Daviplata/Bancolombia + subida de comprobante.
   - **Paso 4**: Confirmación de pedido con número de orden `ORD-DEMO-XXXX` u `ORD-XXXX`.
3. **Transacción de Inventario (`/api/orders/create`)**:
   - Crea o actualiza el registro del cliente en Firestore.
   - Ejecuta descuento atómico de inventario en `products` utilizando `productRepository.adjustStock`.

### C. Panel Administrativo & CRM (`/admin/*`)
- **Autenticación con Google**: Integrada mediante NextAuth v5.
- **Acceso Autorizado**: Valida si el email de Google está en la colección `adminUsers` o en la variable `ADMIN_EMAILS`.
- **Aprobaciones en Cascada (`/api/admin/approve-reserva`)**:
  - Actualiza el estado de la reserva o recibo a confirmado/pagado.
  - Remueve el prefijo `[PENDIENTE]` del evento en Google Calendar y cambia el color del evento.
  - Dispara el envío de correo de confirmación mediante SMTP (Nodemailer).

---

## 🗄️ 3. Modelo de Datos de Firestore

| Colección | Propósito | Campos Clave |
| :--- | :--- | :--- |
| **`customers`** | CRM de consultantes astrales | `id`, `name`, `email`, `phone`, `birthDate`, `notes`, `source`, `active` |
| **`services`** | Catálogo de lecturas astrales | `id`, `name`, `slug`, `duration`, `price`, `active`, `category` |
| **`products`** | Inventario e-commerce | `id`, `name`, `slug`, `price`, `stock`, `minStock`, `imageUrl`, `category`, `active` |
| **`bookings`** | Citas astrales agendadas | `id`, `customerId`, `serviceId`, `scheduledAt`, `durationMinutes`, `status`, `calendarEventId` |
| **`orders`** | Pedidos de productos físicos | `id`, `customerId`, `subtotal`, `shipping`, `total`, `status`, `delivery`, `address` |
| **`payments`** | Recibos y vouchers | `id`, `bookingId`, `orderId`, `amount`, `method`, `status`, `voucherUrl`, `verifiedBy` |
| **`adminUsers`** | Administradores de la app | `id`, `email`, `name`, `role`, `active`, `createdAt` |

---

## 🔧 4. Matriz de Variables de Entorno (.env.local / Vercel)

```env
# ─── Modo de Operación & App ──────────────────────────────
NEXT_PUBLIC_DEMO_MODE="false"               # 'true' para vista previa/demo, 'false' para producción
NEXT_PUBLIC_PAYMENT_MODE="manual"           # 'manual' | 'gateway'
NEXT_PUBLIC_APP_URL="https://tu-dominio.vercel.app"
NEXT_PUBLIC_APP_NAME="Espíritu Ananda"
NEXT_PUBLIC_WHATSAPP_NUMBER="573000000000"

# ─── Autenticación (NextAuth v5) ───────────────────────────
NEXTAUTH_URL="https://tu-dominio.vercel.app"
NEXTAUTH_SECRET="clave_secreta_jwt_de_32_caracteres_minimo"
GOOGLE_CLIENT_ID="930363408123-05bme833pree1fb5906pseqna66s1ug6.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
ADMIN_EMAILS="diegoillers@gmail.com,diegoillers.ux@gmail.com,lina@espiritananda.com"

# ─── Base de Datos Serverless (Firebase Cloud Firestore) ──
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"nexo-celestial-final",...}'
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyDbWEP9ghJQuy4Cjnca7rDUd7jG0G38P1w"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="nexo-celestial-final.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="nexo-celestial-final"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="nexo-celestial-final.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="930363408123"
NEXT_PUBLIC_FIREBASE_APP_ID="1:930363408123:web:b125bdcfc74a42dd25fa5e"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-2WXE21ECXK"

# ─── Google Calendar & Agenda ──────────────────────────────
NEXT_PUBLIC_CALENDAR_ID="diegoillers@gmail.com"
GOOGLE_SERVICE_ACCOUNT_EMAIL="servicio-calendario@nexo-celestial-final.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# ─── Emailing SMTP ─────────────────────────────────────────
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="diegoillers@gmail.com"
SMTP_PASSWORD="contrasena_de_aplicacion_gmail"
SMTP_FROM="Espíritu Ananda <no-reply@espiritananda.com>"

# ─── Cuentas Bancarias para Pago Manual ───────────────────
NEXT_PUBLIC_NEQUI_NUMBER="300 123 4567"
NEXT_PUBLIC_DAVIPLATA_NUMBER="300 123 4567"
NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT="Ahorros 123-456789-00"

# ─── Cron Job Security ────────────────────────────────────
CRON_SECRET="secreto_seguro_para_invocar_cron_cleanup"
```

---

## 🚀 5. Comandos Frecuentes

```bash
# Desarrollo Local
npm run dev

# Verificación de Tipo y Compilación
npm run build

# Despliegue de Reglas de Firebase
npx firebase-tools deploy --only firestore

# Sincronización con Vercel
npx vercel env pull .env.local
```
