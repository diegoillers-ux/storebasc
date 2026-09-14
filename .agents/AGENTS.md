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
| **Pasarela de Pagos** | Mercado Pago SDK v2 (Checkout Pro) | Pago en línea seguro (Tarjetas, Nequi, PSE, Efecty), Webhooks IPN idempotentes y MCP Server oficial |
| **Backend Admin** | Supabase Client (`@supabase/supabase-js`) | Patrón repositorio seguro en endpoints backend con Service Role Key |
| **Autenticación** | Supabase Auth Nativo + NextAuth v5 | Registro de usuarios, confirmación por email, código OTP 6 dígitos y recuperación de clave |
| **Agendamiento** | Google Calendar API | Verificación de franjas horarias libres/ocupadas y creación automática de eventos |
| **Correos** | Nodemailer (SMTP / Gmail) | Plantillas HTML automáticas para recibos, confirmaciones y códigos de verificación |
| **Tareas Cron** | Vercel Cron (`/api/cron/cleanup`) | Liberación de citas reservadas no pagadas (>30 min) |

### ✅ Estado Validado (2026-08-12)

- **Flujo de pago E2E validado en sandbox** (2 ventas): reserva → preferencia MP → pago aprobado → webhook → booking `CONFIRMED` → evento en Google Calendar → correo automático → link de WhatsApp.
- **Google Calendar operativo**: calendario compartido con la Service Account (permiso de edición) y fix de invitación de asistentes cuando la cuenta no tiene Domain-Wide Delegation (`isAttendeeForbiddenError`).
- **RLS auditado y aplicado** (L1): 14 policies verificadas (10 `service_role` + 4 lectura pública).
- **Login real**: contraseña contra Supabase Auth (sin proveedor demo); recuperación de clave funcional; `NEXT_PUBLIC_DEMO_MODE="false"`.
- **CRM sin simulación**: dashboard/reportes con estados vacíos y texto de contexto; módulos sin backend (rifas, contenido IA) devuelven respuestas vacías/501 honestos.
- Pendiente para piloto: ver `docs/04-HOJA-RUTA-PILOTO.md`.

---

## 📁 2. Estructura de Directorios Estandarizada (`main`)

```
storebasc/
├── .agents/                        # Guía del proyecto, MCP config y skills (este archivo)
├── .vscode/                        # Configuración de editor y MCP Server de Mercado Pago (mcp.json)
├── docs/                           # Documentación viva del proyecto (doc mantenida activamente)
│   ├── 03-ROLES-Y-ACCESOS.md       # Modelo de roles, autenticación y permisos (español)
│   ├── 04-HOJA-RUTA-PILOTO.md      # Hoja de ruta hacia las primeras pruebas de uso real
│   ├── PROJECT-MANUAL-V2.md        # Manual técnico definitivo y esquema PostgreSQL
│   ├── QA-E2E-CHECKLIST.md         # Matriz de evaluación End-to-End (PASS)
│   ├── BUGS-FOUND.md               # Bitácora de hallazgos y correcciones
│   ├── CHECKLIST-CLIENTE-REQUISITOS.md  # Requisitos y credenciales pendientes del cliente (Lina)
│   └── VERCEL-VARIABLES-GUIDE.md   # Matriz limpia de variables de entorno de Vercel
├── ENTREGA-CLIENTE/                # Paquete oficial de entrega al cliente (MD + PDF) — no editar aquí
├── public/                         # Assets estáticos (logo de la marca)
├── src/
│   ├── app/                        # Rutas de Next.js (App Router)
│   │   ├── (admin)/admin/          # Panel administrativo único protegido (/admin/*)
│   │   ├── (public)/               # Portada pública comercial (/servicios, /tienda)
│   │   ├── api/                    # API Routes backend (bookings, orders, availability, checkout/preference, webhooks/mercadopago, cron)
│   │   ├── checkout/               # Embudos de pago (3 pasos para citas, 4 pasos para tienda)
│   │   ├── forgot-password/        # Pantalla de solicitud de recuperación de clave
│   │   ├── login/                  # Pantalla de inicio de sesión
│   │   ├── register/               # Pantalla de registro de nuevos administradores
│   │   └── verify-otp/             # Pantalla de verificación de código numérico de 6 dígitos
│   ├── components/                 # Componentes UI reutilizables
│   │   ├── admin/                  # Sidebar, Topbar, visores zoom de recibos
│   │   ├── public/                 # AvailabilityCalendar, CartDrawer, ProductCard, ServiceCard, Header, Footer
│   │   └── ui/                     # Alertas, modales, loaders
│   ├── context/                    # CartContext global de e-commerce
│   └── lib/                        # Lógica de negocio y repositorios de datos
│       ├── calendar/               # Google Calendar (provider en google.ts + cliente en ../googleCalendar.ts)
│       ├── payments/               # Capa adaptadora de pagos (mercadopago.ts, manual.ts, index.ts)
│       ├── supabase/               # Conexión Supabase (client, server, schema.sql, migraciones y repositorios SQL)
│       ├── auth.ts                 # Configuración de NextAuth v5 & Supabase Auth (callbacks, JWT)
│       ├── auth.config.ts          # Opciones de NextAuth (login por correo o cédula)
│       ├── adminAuth.ts            # requireAdminSession() para rutas API del panel
│       ├── cronAuth.ts             # Validación de CRON_SECRET para tareas programadas
│       ├── rateLimit.ts            # Rate limiting de endpoints sensibles (login, checkout, webhook)
│       ├── demoMode.ts             # Helper de modo dual (Demo vs Producción Real)
│       ├── mailer.ts               # Envío de correos Nodemailer (Recibos, Notificaciones, OTP)
│       └── googleCalendar.ts       # Cliente oficial de Google Calendar SDK
├── .env.example                    # Plantilla oficial de variables de entorno
├── .npmrc                          # legacy-peer-deps (instalación reproducible)
├── .gitignore                      # Incluye .env*, logs, *.tsbuildinfo, .vscode/
├── CLAUDE.md                       # Apunta a AGENTS.md
├── opencode.json                   # Registro del MCP Server de Mercado Pago para opencode
├── AGENTS.md                       # Bloque auto-generado por `next dev` (reglas Next.js 16) — no editar
├── next.config.ts                  # Configuración Next.js, redirecciones y headers de seguridad (CSP)
├── seed-supabase.mjs               # Script de siembra inicial de la base de datos Supabase
├── tailwind.config.ts              # Tokens de diseño místico y paletas Ananda
└── vercel.json                     # Configuración de despliegue Vercel y Cron
```

---

## 🚫 3. Reglas Inviolables del Proyecto

1. **Rama Única (`main`)**:
   - Todo el trabajo debe ser realizado y commiteado directamente sobre la rama `main`.
   - **NO crear ni subir ramas secundarias** a GitHub (`origin`).
2. **Pasarela Única Oficial (Mercado Pago)**:
   - **Mercado Pago** es la pasarela de pagos oficial. Wompi ha sido eliminado 100% del proyecto.
   - `NEXT_PUBLIC_PAYMENT_PROVIDER` (`'mercadopago'` | `'manual'`) es la única variable que controla la pasarela activa.
3. **Sin Código ni Documentos Legados u Obsoletos**:
   - Queda prohibido reintroducir carpetas legadas fuera de las estructuras `(public)` y `(admin)`.
   - Toda documentación debe ser mantenida exclusivamente en `docs/` y sincronizada con el estado real del código.
4. **Seguridad y Secretos**:
   - NUNCA commitear archivos `.env`, `.env.local` ni claves privadas PEM.
   - Las escrituras backend en Supabase se realizan mediante `SUPABASE_SERVICE_ROLE_KEY` exclusivamente desde el servidor (`src/lib/supabase/server.ts`).
5. **Respetar Modo Dual de Operación**:
   - `NEXT_PUBLIC_DEMO_MODE="true"` permite probar y evaluar la aplicación en preproducción sin requerir credenciales reales en producción.
   - **En producción la variable debe ser `"false"`** (hoy lo es). Las ramas demo-mode solo devuelven arrays vacíos — nunca datos simulados.
6. **CRM/Dashboard sin datos simulados**:
   - Prohibido reintroducir métricas, citas, ventas o alertas falsas en el panel. Los módulos sin datos muestran estados vacíos con texto de contexto o prefill genérico (presets de branding y defaults de formulario sí están permitidos).
7. **Módulos sin backend integrado**:
   - Las APIs de módulos no conectados (rifas, contenido IA) deben responder con arrays vacíos o 501/400 honestos ("integración pendiente") — nunca devolver mock data.
8. **Next.js 16 (reglas de `node_modules/next/dist/docs/`)**:
   - Leer la guía relevante antes de escribir código; respetar deprecaciones (pendiente: migrar `middleware.ts` → `proxy`).

---

## 🚀 4. Propuesta de Plan de Trabajo para las Fases Siguientes (J, K, L) — Hoja de Ruta Pendiente

> [!IMPORTANT]
> **Estado 2026-08-12:** J3, K1, L1 y L3 están COMPLETOS. K2 y K3 fueron CANCELADOS por decisión del usuario. Pendientes: J1, J2 (parcial), J4 y L2. La ruta de avance a pruebas reales está en `docs/04-HOJA-RUTA-PILOTO.md`.

| Fase | Tarea | Estado |
| :--- | :--- | :--- |
| **J1** | SMTP Gmail App Password real de Lina | ⏳ Pendiente |
| **J2** | Google Calendar de producción: la Service Account YA funciona y el calendario está compartido (permiso edición), pero apunta al calendario de Diego → falta el de Lina | 🔶 Parcial |
| **J3** | Key real de Supabase Service Role (proyecto remoto) | ✅ Completo |
| **J4** | Credenciales Mercado Pago Producción `APP_USR-...` | ⏳ Pendiente |
| **K1** | Link de WhatsApp con mensaje prediligenciado (confirmación + resumen) | ✅ Completo (validado E2E) |
| **K2** | PWA (Service Worker & Manifest) | ❌ Cancelado (decisión del usuario) |
| **K3** | Optimizaciones de carga en celulares | ❌ Cancelado (decisión del usuario) |
| **L1** | Auditoría final de tablas Supabase RLS | ✅ Completo (14 policies verificadas) |
| **L2** | Conexión de dominio espiritananda.com | ⏳ Pendiente |
| **L3** | `NEXT_PUBLIC_DEMO_MODE="false"` y retiro de acceso demo del login | ✅ Completo |
