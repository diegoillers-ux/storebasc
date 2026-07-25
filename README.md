# AnandaStore V2 — Plataforma Holística & E-Commerce Astral

**Proyecto:** AnandaStore V2  
**Rama Principal:** `main` (Única rama oficial de producción)  
**Stack Principal:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Cloud Firestore + NextAuth v5 + Google Calendar API  

---

## 🌟 Visión del Proyecto

**AnandaStore V2** es una plataforma integral diseñada para la consultante mística Lina (**Espíritu Ananda**). Combina:
1. **Embudo de Servicios Astrales**: Catálogo de lecturas (Carta Natal, Tarot Express, Revolución Solar, Sinastría), registro natal del consultante, agendamiento de horarios en vivo con cálculo de disponibilidad y subida de comprobantes de pago manual (Nequi, Daviplata, Bancolombia) o pasarela Wompi.
2. **Tienda Holística E-Commerce**: Catálogo de productos artesanales (sahumerios, cuarzos, velas, elixires) con carrito lateral dinámico (`CartDrawer`), control de inventario y wizard de despacho en 4 pasos.
3. **Panel Administrativo (CRM & Finanzas)**: Gestión de clientes astrales, agenda de citas, conciliación de pagos en cascada con sincronización automática a Google Calendar y notificaciones SMTP por correo.
4. **Módulo de Marketing e IA**: Generación de banners comerciales adaptados a formatos sociales (Historias 9:16, IG 1:1, FB 1.91:1) potenciado por Gemini.

---

## 🚀 Arquitectura Tecnológica & Stack V2

| Capa | Tecnología / Herramienta | Función |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 16.1 (App Router + Turbopack) | Enrutamiento híbrido (SSR, ISR, Server Components) |
| **Lenguaje** | TypeScript 5 | Tipado estricto en repositorios, APIs y componentes UI |
| **Estilos & UI** | Tailwind CSS v4 + PostCSS | Diseño místico, paleta `--color-ananda-*`, tarjetas glassmorphism |
| **Base de Datos** | Firebase Cloud Firestore | Base de datos NoSQL serverless ACID atómica |
| **Acceso Firestore** | Firebase Admin SDK (`firebase-admin`) | Patrón repositorio seguro en endpoints backend |
| **Autenticación** | NextAuth v5 (Beta 29) | Autenticación Edge con Google OAuth 2.0 y control de roles |
| **Calendario** | Google Calendar API | Verificación de franjas libres/ocupadas y creación de eventos |
| **Notificaciones** | Nodemailer (SMTP / Gmail) | Correos automáticos de confirmación y plantilla HTML |
| **Tareas Programadas** | Vercel Cron (`/api/cron/cleanup`) | Liberación automática de citas reservadas no pagadas (>30 min) |

---

## 📁 Estructura Completa del Proyecto (`main`)

```
storebasc/
├── docs/                           # Documentación oficial de arquitectura, QA y despliegue
│   ├── QA-E2E-CHECKLIST.md         # Matriz de evaluación End-to-End (PASS/FAIL)
│   ├── BUGS-FOUND.md               # Bitácora de hallazgos y fixes P0/P1
│   └── VERCEL-VARIABLES-GUIDE.md   # Matriz limpia de variables de entorno de Vercel
├── public/                         # Assets estáticos (imágenes, favicons)
├── src/
│   ├── app/                        # Rutas de Next.js (App Router)
│   │   ├── (admin)/                # Panel administrativo protegido (/admin/*)
│   │   │   ├── agenda/             # Calendario y citas
│   │   │   ├── clientes/           # CRM de consultantes y datos astrales
│   │   │   ├── pagos/              # Conciliación de recibos Nequi/Daviplata
│   │   │   ├── pedidos/            # Logística y despachos e-commerce
│   │   │   └── rifas/              # Sorteos y rifas astrales
│   │   ├── (public)/               # Portada pública comercial
│   │   │   ├── servicios/          # Catálogo público de lecturas astrales
│   │   │   ├── tienda/             # Catálogo público de productos artesanales
│   │   │   └── page.tsx            # Landing page principal con héroe cósmico
│   │   ├── api/                    # API Routes backend
│   │   │   ├── admin/              # Endpoints administrativos con verificación de rol
│   │   │   ├── availability/       # Cálculo de disponibilidad de fechas y horas
│   │   │   ├── bookings/create     # Creación de cita y cliente
│   │   │   ├── cron/cleanup        # Tarea programada de liberación de citas vencidas
│   │   │   ├── orders/create       # Creación de pedido e-commerce y ajuste de stock
│   │   │   └── webhooks/wompi      # Webhook de pasarela de pago Wompi
│   │   ├── checkout/               # Embudos de pago y agendamiento
│   │   │   ├── [serviceId]/        # Wizard 3 pasos para servicios (Datos -> Fecha -> Pago)
│   │   │   ├── product/            # Wizard 4 pasos para productos (Resumen -> Envío -> Pago -> Confirmación)
│   │   │   └── success/            # Confirmación unificada con estrellas y confeti
│   │   └── login/                  # Pantalla de inicio de sesión con Google OAuth
│   ├── components/                 # Componentes UI reutilizables
│   │   ├── admin/                  # Sidebar, Topbar, visores zoom de recibos
│   │   └── public/                 # AvailabilityCalendar, CartDrawer, ProductCard, ServiceCard, PublicHeader, PublicFooter
│   ├── context/                    # Contextos globales (CartContext)
│   ├── lib/                        # Capa de lógica y repositorios
│   │   ├── firebase/               # Conexión Firestore, converters y repositorios
│   │   │   └── repositories/       # services, products, bookings, orders, payments, customers, availability
│   │   ├── auth.ts                 # Configuración de NextAuth v5 y roles admin
│   │   ├── demoMode.ts             # Helper de cambio dual (Modo Demo vs Producción Real)
│   │   ├── googleCalendar.ts       # Cliente oficial de Google Calendar SDK
│   │   └── mailer.ts               # Plantillas de correo SMTP
├── .env.example                    # Plantilla de variables de entorno
├── .firebaserc                     # Vinculación de proyecto Firebase CLI
├── firebase.json                   # Reglas de despliegue Firebase
├── firestore.rules                 # Reglas de seguridad NoSQL
├── next.config.ts                  # Configuración de Next.js
├── tailwind.config.ts              # Tokens de diseño místico y paletas Ananda
└── vercel.json                     # Configuración de despliegue y Vercel Cron
```

---

## 🔑 Variables de Entorno Recomendadas

Crea un archivo `.env.local` basado en `.env.example`:

```env
# Modo de Operación (true para desarrollo/demo local sin Firebase real)
NEXT_PUBLIC_DEMO_MODE="true"
NEXT_PUBLIC_PAYMENT_MODE="manual"

# URLs de Aplicación
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="clave_secreta_jwt_de_32_caracteres_minimo"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="930363408123-...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
ADMIN_EMAILS="diegoillers@gmail.com,lina@espiritananda.com"

# Firebase Cloud Firestore (Web Client)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="nexo-celestial-final.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="nexo-celestial-final"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="nexo-celestial-final.firebasestorage.app"

# Cuentas para Transferencias Manuales
NEXT_PUBLIC_NEQUI_NUMBER="300 123 4567"
NEXT_PUBLIC_DAVIPLATA_NUMBER="300 123 4567"
NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT="Ahorros 123-456789-00"
```

---

## 🛠️ Comandos de Desarrollo & Mantenimiento

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar bundle de producción y verificar TypeScript
npm run build

# 4. Probar seeder de base de datos de prueba
node --env-file=.env.local seed-catalog.mjs
```

---

## 📌 Estado de Git y Despliegue

- **Rama única oficial:** `main`
- **Integridad:** Todo el historial de rediseño, pruebas E2E y fixes ha sido consolidado en `main`.
- **Despliegue Vercel:** Vinculado al proyecto `diego-illeras-projects/storebasc`.
