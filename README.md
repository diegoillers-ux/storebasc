# AnandaStore V2 — Plataforma Holística & E-Commerce Astral

**Proyecto:** AnandaStore V2  
**Rama Principal:** `main` (Única rama oficial de producción)  
**Stack Principal:** Next.js 16 (App Router + Turbopack) + TypeScript + Tailwind CSS v4 + Supabase (PostgreSQL & Auth) + NextAuth v5 + Google Calendar API  

---

## 🌟 Visión del Proyecto

**AnandaStore V2** es una plataforma integral diseñada para la consultante mística Lina (**Espíritu Ananda**). Combina:
1. **Embudo de Servicios Astrales**: Catálogo de lecturas (Carta Natal, Tarot Express, Revolución Solar, Sinastría), registro natal del consultante, agendamiento de horarios en vivo con cálculo de disponibilidad y subida de comprobantes de pago manual (Nequi, Daviplata, Bancolombia) o pasarela Wompi.
2. **Tienda Holística E-Commerce**: Catálogo de productos artesanales (sahumerios, cuarzos, velas, elixires) con carrito lateral dinámico (`CartDrawer`), control de inventario y wizard de despacho en 4 pasos.
3. **Panel Administrativo (CRM & Finanzas)**: Gestión de clientes astrales, agenda de citas, conciliación de pagos en cascada con sincronización automática a Google Calendar y notificaciones SMTP por correo.
4. **Módulo de Autenticación & Permisos**: Registro de usuarios administradores con confirmación por correo electrónico, envío de código numérico OTP de 6 dígitos, recuperación de clave y control de roles (`SUPER_ADMIN`, `ADMIN`, `OPERATOR`, `READER`).

---

## 🚀 Arquitectura Tecnológica & Stack V2

| Capa | Tecnología / Herramienta | Función |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 16.1 (App Router + Turbopack) | Enrutamiento híbrido (SSR, ISR, Server Components) |
| **Lenguaje** | TypeScript 5 | Tipado estricto en repositorios, APIs y componentes UI |
| **Estilos & UI** | Tailwind CSS v4 + PostCSS | Diseño místico, paleta `--color-ananda-*`, tarjetas glassmorphism |
| **Base de Datos** | Supabase (PostgreSQL Relacional) | Base de datos SQL serverless (repositorios en `src/lib/supabase/repositories/`) |
| **Autenticación** | Supabase Auth Nativo + NextAuth v5 | Registro de usuarios, confirmación por email, código OTP 6 dígitos y recuperación de clave |
| **Calendario** | Google Calendar API | Verificación de franjas libres/ocupadas y creación de eventos |
| **Notificaciones** | Nodemailer (SMTP / Gmail) | Correos automáticos de confirmación, recibos y códigos de verificación OTP |
| **Tareas Programadas** | Vercel Cron (`/api/cron/cleanup`) | Liberación automática de citas reservadas no pagadas (>30 min) |

---

## 📁 Estructura Completa del Proyecto (`main`)

```
storebasc/
├── docs/                           # Documentación oficial de arquitectura, QA y despliegue
│   ├── PROJECT-MANUAL-V2.md        # Manual técnico definitivo y esquema SQL PostgreSQL
│   ├── QA-E2E-CHECKLIST.md         # Matriz de evaluación End-to-End (PASS)
│   ├── BUGS-FOUND.md               # Bitácora de hallazgos y correcciones
│   └── VERCEL-VARIABLES-GUIDE.md   # Matriz limpia de variables de entorno de Vercel
├── public/                         # Assets estáticos (imágenes, favicons)
├── src/
│   ├── app/                        # Rutas de Next.js (App Router)
│   │   ├── (admin)/admin/          # Panel administrativo protegido (/admin/*)
│   │   ├── (public)/               # Portada pública comercial (/servicios, /tienda)
│   │   ├── api/                    # API Routes backend (bookings, orders, availability, cron)
│   │   ├── checkout/               # Embudos de pago (3 pasos para citas, 4 pasos para tienda)
│   │   ├── forgot-password/        # Pantalla de solicitud de recuperación de clave
│   │   ├── login/                  # Pantalla de inicio de sesión
│   │   ├── register/               # Pantalla de registro de nuevos administradores
│   │   └── verify-otp/             # Pantalla de verificación de código numérico de 6 dígitos
│   ├── components/                 # Componentes UI reutilizables
│   │   ├── admin/                  # Sidebar, Topbar, visores zoom de recibos
│   │   ├── public/                 # AvailabilityCalendar, CartDrawer, ProductCard, ServiceCard, PublicHeader, PublicFooter
│   │   └── ui/                     # Alertas, modales, loaders
│   ├── context/                    # Contextos globales (CartContext)
│   └── lib/                        # Capa de lógica y repositorios
│       ├── supabase/               # Conexión Supabase (client, server, schema.sql y repositorios SQL)
│       ├── auth.ts                 # Configuración de NextAuth v5 & Supabase Auth
│       ├── demoMode.ts             # Helper de cambio dual (Modo Demo vs Producción Real)
│       ├── mailer.ts               # Plantillas de correo SMTP y verificación OTP
│       └── googleCalendar.ts       # Cliente oficial de Google Calendar SDK
├── .env.example                    # Plantilla oficial de variables de entorno
├── next.config.ts                  # Configuración de Next.js
├── seed-supabase.mjs               # Script de siembra inicial de la base de datos Supabase
├── tailwind.config.ts              # Tokens de diseño místico y paletas Ananda
└── vercel.json                     # Configuración de despliegue y Vercel Cron
```

---

## 🔑 Variables de Entorno Recomendadas

Crea un archivo `.env.local` basado en `.env.example`:

```env
# Modo de Operación (true para desarrollo/demo local)
NEXT_PUBLIC_DEMO_MODE="true"
NEXT_PUBLIC_PAYMENT_MODE="manual"

# URLs de Aplicación
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase (Base de Datos PostgreSQL & Autenticación)
NEXT_PUBLIC_SUPABASE_URL="https://abcdefgh.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# Administradores Autorizados
ADMIN_EMAILS="lina@espiritananda.com,diegoillers@gmail.com"

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

# 4. Poblar la base de datos de prueba en Supabase
node seed-supabase.mjs
```

---

## 📌 Estado de Git y Despliegue

- **Rama única oficial:** `main`
- **Integridad:** Todo el historial de rediseño, pruebas E2E y fixes ha sido consolidado en `main`.
- **Despliegue Vercel:** Vinculado al proyecto `diego-illeras-projects/storebasc`.
