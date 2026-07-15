# Espíritu Ananda V2 — Panel de Control & Tienda Mística

Plataforma integral de reserva de servicios holísticos, venta de productos artesanales, y gestión de marketing con Inteligencia Artificial (Gemini) construida para **Espíritu Ananda**.

---

## 🚀 Arquitectura Tecnológica (Stack V2)

La versión 2.0 ha sido rediseñada y refactorizada completamente desde cero para reemplazar la base de datos relacional anterior por una arquitectura Serverless escalable:

*   **Framework**: Next.js 16 (App Router, Turbopack) para renderizado híbrido y APIs eficientes.
*   **Estilos**: Tailwind CSS v4 (compilado mediante PostCSS para soporte total en producción).
*   **Base de Datos**: Firebase Suite (Cloud Firestore para almacenamiento no relacional y Firebase Auth).
*   **Acceso Backend**: Patrón Repositorio en NodeJS utilizando `firebase-admin` en endpoints seguros.
*   **Autenticación**: NextAuth v5 (Edge-compatible) integrado con Google OAuth 2.0.
*   **Sincronización Externa**: Integración transaccional bidireccional con Google Calendar API.
*   **IA de Campañas**: Generación de banners comerciales a través del motor de Gemini/Unsplash.
*   **Correos**: Envío de correos automáticos usando SMTP (Gmail App Password) con plantillas personalizables.

---

## 📁 Estructura del Proyecto

```
├── .next/                    # Compilación de Next.js
├── .vercel/                  # Configuración de despliegue en Vercel
├── docs/                     # Documentación técnica adicional
├── src/
│   ├── app/                  # Enrutamiento de Next.js (App Router)
│   │   ├── (admin)/admin/    # Rutas administrativas protegidas (CRM, Agenda, Ventas, Pagos, Rifas)
│   │   ├── api/admin/        # APIs administrativas seguras (con chequeo de rol admin)
│   │   ├── api/auth/         # Rutas de autenticación de NextAuth
│   │   ├── checkout/         # Embudo de pago y reserva para clientes
│   │   ├── login/            # Pantalla de acceso administrativo
│   │   └── page.tsx          # Landing page comercial pública (en cola de rediseño)
│   ├── components/           # Componentes UI reutilizables
│   │   ├── admin/            # Sidebar, Topbar y componentes administrativos
│   │   └── ui/               # Componentes de interfaz comunes (loaders, alertas)
│   ├── lib/                  # Código y librerías compartidas
│   │   ├── firebase/         # Conexión, esquemas y repositorios de datos
│   │   │   ├── repositories/ # Bookings, Customers, Payments, Products, Orders, Rifas, AI-Assets
│   │   │   └── admin.ts      # Inicialización segura de firebase-admin
│   │   └── calendar/         # Proveedor e integraciones con Google Calendar
├── deploy-env.mjs            # Script automatizado para cargar variables y desplegar en Vercel
├── firestore.rules           # Reglas de seguridad de base de datos
├── firestore.indexes.json    # Índices compuestos requeridos para consultas complejas
└── tailwind.config.ts        # Tokens y variables de diseño místico (violetas, cuarzos, oro)
```

---

## 🔐 Variables de Entorno (.env)

Configura estas variables en tu archivo `.env` local o en el panel de Vercel:

| Variable | Descripción | Ejemplo / Valor |
| :--- | :--- | :--- |
| `NEXTAUTH_URL` | URL base de la app para cookies | `http://localhost:3000` o `https://refactor-ananda-store-v2.vercel.app` |
| `AUTH_URL` | URL base requerida por NextAuth en Vercel | `https://refactor-ananda-store-v2.vercel.app` |
| `AUTH_SECRET` | Llave secreta de 32 bytes para cifrar sesiones | *(Generado aleatoriamente)* |
| `NEXT_PUBLIC_BYPASS_AUTH` | Bypassear Login de Google en desarrollo | `true` (local) \| `false` (producción) |
| `GOOGLE_CLIENT_ID` | ID del Cliente OAuth de Google Cloud | `930363408123-nivqf5itq...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Secreto del Cliente OAuth de Google Cloud | `GOCSPX-vB1Cg3MQgI...` |
| `NEXT_PUBLIC_CALENDAR_ID` | ID del calendario de Google Calendar | `tu-calendario-astral@gmail.com` |
| `GOOGLE_CLIENT_EMAIL` | Email de la cuenta de servicio de Google Cloud | `servicio-calendario@proyecto.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Clave privada PEM de la cuenta de servicio | `"-----BEGIN PRIVATE KEY-----\n..."` |
| `SMTP_HOST` | Servidor SMTP para envío de notificaciones | `smtp.gmail.com` |
| `SMTP_PORT` | Puerto de conexión SMTP | `587` |
| `SMTP_USER` | Correo emisor del sistema | `correos-ananda@gmail.com` |
| `SMTP_PASSWORD` | Contraseña de aplicación de Gmail | `abcd efgh ijkl mnop` |
| `SMTP_FROM` | Firma y remitente de los correos | `Espíritu Ananda <no-reply@espiritananda.com>` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Llave pública de Firebase Client | `AIzaSyDbWE...` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID de proyecto de Firebase | `nexo-celestial-final` |
| *(Otras Firebase keys)* | Propiedades del SDK Cliente | Ver configuración en consola de Firebase |

---

## 🛠️ Configuración y Ejecución Local

### 1. Clonar e Instalar Dependencias
```bash
npm install
```

### 2. Poblar Base de Datos de Prueba (Seeding)
El proyecto incluye scripts en JavaScript para poblar tu base de datos de Firestore con data inicial ficticia de alta calidad para probar el sistema:
```bash
# Cargar catálogo de servicios astrales iniciales
node seed-catalog.mjs

# Cargar clientes y citas de prueba
node seed-firebase.mjs

# Cargar configuraciones de correo SMTP por defecto
node seed-mail.mjs
```

### 3. Ejecutar Servidor de Desarrollo
```bash
npm run dev
```
Abre **`http://localhost:3000`** en tu navegador.

---

## 🌐 Despliegue en Producción (Vercel)

El proyecto cuenta con un script de automatización (`deploy-env.mjs`) que analiza tu archivo `.env` local, registra de forma limpia todas las variables de entorno en tu panel de Vercel (eliminando duplicados y previniendo errores de Edge runtime) y compila la versión final.

Para desplegar:
1. Inicia sesión en la terminal con Vercel CLI:
   ```bash
   vercel login
   ```
2. Ejecuta el script de despliegue automatizado:
   ```bash
   node deploy-env.mjs
   ```
El script te entregará la URL final de producción activa.

---

## 🗄️ Esquema de Colecciones en Firestore

*   **`adminUsers`**: Administradores del panel. Estructura: `{ email, name, role, active, createdAt, updatedAt }`.
*   **`customers`**: Datos personales de consultantes e historial natal. Estructura: `{ email, name, phone, birthDate, birthTime, birthPlace, notes, createdAt }`.
*   **`services`**: Catálogo de lecturas y terapias holísticas. Estructura: `{ name, slug, duration, price, active }`.
*   **`bookings`**: Reservas de citas vinculadas con Google Calendar. Estructura: `{ customerId, serviceId, date, timeSlot, status, calendarEventId }`.
*   **`payments`**: Recibos y conciliaciones. Estructura: `{ bookingId, orderId, amount, method, status, voucherUrl, verifiedBy, createdAt }`.
*   **`products`**: Inventario de la tienda artesanal. Estructura: `{ name, price, stock, minStock, description, imageUrl, active }`.
*   **`orders`**: Pedidos físicos de e-commerce. Estructura: `{ customerId, items: [{ productId, quantity, price }], total, status, shippingAddress, createdAt }`.
*   **`aiAssets`**: Historial de banners e imágenes promocionales generadas por IA. Estructura: `{ url, prompt, format, status, createdAt }`.
