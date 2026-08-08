# 🤖 AGENTS.md — Guía del Proyecto & Protocolo de Desarrollo (AnandaStore V2)

**Proyecto:** AnandaStore V2 — Plataforma Holística, Citas Astrales & E-Commerce  
**Cliente / Marca:** Lina (Espíritu Ananda)  
**Rama Oficial Única:** `main` (Única rama activa en Git y GitHub)  
**Repositorio:** `diegoillers-ux/storebasc`  
**Despliegue Único:** `https://storebasc.vercel.app` (Vercel Preproducción)  

---

## 🏛️ 1. Resumen de Arquitectura y Estado Actual

El proyecto ha sido refactorizado y estandarizado al 100% en la versión 2.0. El estado actual de la plataforma comprende:

| Capa | Tecnología / Configuración | Función |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.1 (App Router + Turbopack) | Renderizado SSR/ISR, Server Actions y API Routes |
| **Estilos & UI** | Tailwind CSS v4 + PostCSS | Paleta `--color-ananda-*`, tarjetas glassmorphism, responsive móvil |
| **Base de Datos** | Supabase (PostgreSQL Relacional) | Base de datos SQL serverless (repositorios en `src/lib/supabase/repositories/`) |
| **Backend Admin** | Supabase Client (`@supabase/supabase-js`) | Patrón repositorio seguro en endpoints backend con Service Role Key |
| **Autenticación** | Supabase Auth Nativo + NextAuth v5 | Registro de usuarios, confirmación por email, código OTP 6 dígitos y recuperación de clave |
| **Agendamiento** | Google Calendar API | Verificación de franjas horarias libres/ocupadas |
| **Correos** | Nodemailer (SMTP / Gmail) | Plantillas HTML automáticas para recibos, confirmaciones y códigos de verificación |
| **Tareas Cron** | Vercel Cron (`/api/cron/cleanup`) | Liberación de citas reservadas no pagadas (>30 min) |

---

## 📁 2. Estructura de Directorios Estandarizada (`main`)

```
storebasc/
├── docs/                           # Documentación oficial y checklists activos
│   ├── PROJECT-MANUAL-V2.md        # Manual técnico definitivo y esquema PostgreSQL
│   ├── QA-E2E-CHECKLIST.md         # Matriz de evaluación End-to-End (PASS)
│   ├── BUGS-FOUND.md               # Bitácora de hallazgos y correcciones
│   └── VERCEL-VARIABLES-GUIDE.md   # Matriz limpia de variables de entorno de Vercel
├── public/                         # Assets estáticos (logotipos, favicons)
├── src/
│   ├── app/                        # Rutas de Next.js (App Router)
│   │   ├── (admin)/admin/          # Panel administrativo único protegido (/admin/*)
│   │   ├── (public)/               # Portada pública comercial y catálogo (/servicios, /tienda)
│   │   ├── api/                    # API Routes backend (bookings, orders, availability, cron)
│   │   ├── checkout/               # Embudos de pago (3 pasos para citas, 4 pasos para tienda)
│   │   ├── forgot-password/        # Pantalla de solicitud de recuperación de clave
│   │   ├── login/                  # Pantalla de inicio de sesión
│   │   ├── register/               # Pantalla de registro de nuevos administradores
│   │   ├── reset-password/         # Pantalla de restablecimiento de contraseña
│   │   └── verify-otp/             # Pantalla de verificación de código numérico de 6 dígitos
│   ├── components/                 # Componentes UI reutilizables
│   │   ├── admin/                  # Sidebar, Topbar, visores zoom de recibos
│   │   ├── public/                 # AvailabilityCalendar, CartDrawer, ProductCard, ServiceCard, Header, Footer
│   │   └── ui/                     # Alertas, modales, loaders
│   ├── context/                    # CartContext global de e-commerce
│   └── lib/                        # Lógica de negocio y repositorios de datos
│       ├── supabase/               # Conexión Supabase (client, server, schema.sql y repositorios SQL)
│       ├── auth.ts                 # Configuración de NextAuth v5 & Supabase Auth
│       ├── demoMode.ts             # Helper de modo dual (Demo vs Producción Real)
│       ├── mailer.ts               # Envío de correos Nodemailer (Recibos, Notificaciones, OTP)
│       └── googleCalendar.ts       # Integración con Google Calendar SDK
├── .env.example                    # Plantilla oficial de variables de entorno
├── .env.local                      # Variables locales de desarrollo/preproducción
├── AGENTS.md                       # Este documento de referencia para agentes AI y desarrolladores
├── next.config.ts                  # Configuración Next.js y redirecciones
├── seed-supabase.mjs               # Script de siembra inicial de la base de datos Supabase
├── tailwind.config.ts              # Tokens de diseño místico y paletas Ananda
└── vercel.json                     # Configuración de despliegue Vercel y Cron
```

---

## 🚫 3. Reglas Inviolables del Proyecto

1. **Rama Única (`main`)**:
   - Todo el trabajo debe ser realizado y commiteado directamente sobre la rama `main`.
   - **NO crear ni subir ramas secundarias** a GitHub (`origin`).
2. **Sin Código ni Documentos Legados u Obsoletos**:
   - Queda prohibido reintroducir carpetas legadas fuera de las estructuras `(public)` y `(admin)`.
   - Toda documentación debe ser mantenida exclusivamente en `docs/` y sincronizada con el estado real del código.
3. **Seguridad y Secretos**:
   - NUNCA commitear archivos `.env`, `.env.local` ni claves privadas PEM.
   - Las escrituras backend en Supabase se realizan mediante `SUPABASE_SERVICE_ROLE_KEY` exclusivamente desde el servidor (`src/lib/supabase/server.ts`).
4. **Respetar Modo Dual de Operación**:
   - `NEXT_PUBLIC_DEMO_MODE="true"` permite probar y evaluar la aplicación en preproducción sin requerir credenciales reales en producción.

---

## 🚀 4. Propuesta de Plan de Trabajo para las Fases Siguientes (J, K, L)

> [!IMPORTANT]
> **ESTE PLAN ESTÁ PLANIFICADO Y LISTO PARA EJECUCIÓN FUTURA. NO INICIAR LAS FASES HASTA INDICACIÓN EXPRESA DEL USUARIO.**

```mermaid
flowchart TD
    subgraph FaseJ ["Fase J: Credenciales & Servicios Reales"]
        J1["J1. SMTP Gmail App Password real de Lina"]
        J2["J2. Google Service Account & Calendar ID"]
        J3["J3. Key real de Supabase Service Role en Vercel"]
    end

    subgraph FaseK ["Fase K: UX, PWA & Automatización"]
        K1["K1. Mensajes automáticos de WhatsApp"]
        K2["K2. PWA (Service Worker & Manifest)"]
        K3["K3. Optimizaciones de carga en celulares"]
    end

    subgraph FaseL ["Fase L: Pase a Producción"]
        L1["L1. Auditoría final de tablas Supabase RLS"]
        L2["L2. Conexión de dominio espiritananda.com"]
        L3["L3. Desactivación de Demo Mode (NEXT_PUBLIC_DEMO_MODE=false)"]
    end

    FaseJ --> FaseK --> FaseL
```

### 📋 Detalle de Fases Planificadas:

#### **Fase J — Integraciones & Credenciales Reales (Lina)**
- **J1. Configuración SMTP Real**: Reemplazar las variables `SMTP_USER` y `SMTP_PASSWORD` con las credenciales de aplicación de Gmail de Lina para enviar correos transaccionales reales.
- **J2. Google Calendar API de Producción**: Vincular el email personal de Lina (`NEXT_PUBLIC_CALENDAR_ID`) con una Service Account de Google Cloud para el agendamiento directo en su agenda personal.
- **J3. Supabase Service Role Key**: Configurar `SUPABASE_SERVICE_ROLE_KEY` en el panel de Vercel para conectarse al proyecto Supabase de producción real.

#### **Fase K — Experiencia de Usuario, PWA & Automatizaciones**
- **K1. Automatización WhatsApp**: Implementar redirección inteligente con mensaje prediligenciado que contenga el resumen de la cita/pedido directamente al número de WhatsApp de Lina.
- **K2. Configuración PWA**: Crear `manifest.json` y `service-worker.js` con soporte offline e instalación en pantalla de inicio para Android e iOS.
- **K3. Rendimiento Móvil**: Optimización de imágenes en formatos WebP/AVIF y lazy loading en dispositivos móviles de gama media/baja.

#### **Fase L — Pase a Producción & Lanzamiento Comercial**
- **L1. Auditoría de Seguridad**: Verificación final de políticas de seguridad RLS en PostgreSQL Supabase (`src/lib/supabase/schema.sql`).
- **L2. Dominio Personalizado**: Asignar y certificar SSL para `espiritananda.com` en Vercel.
- **L3. Conmutación a Producción Real**: Cambiar `NEXT_PUBLIC_DEMO_MODE="false"` y retirar el acceso demo de la pantalla de login.
