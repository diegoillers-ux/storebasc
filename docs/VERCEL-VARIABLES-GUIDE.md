# 🔑 Manual Oficial de Variables de Entorno — AnandaStore V2

Este documento detalla todas las variables de entorno utilizadas en **AnandaStore V2**, su función dentro de la arquitectura de la aplicación y el procedimiento paso a paso para obtener cada clave o credencial desde las consolas oficiales (Google Cloud, Supabase, Vercel, Gmail).

> **Versión sincronizada con el código:** agosto 2026. Cualquier variable que no esté listada aquí debe considerarse obsoleta.

---

## 🏛️ 1. Configuración General & Modos de la Aplicación

### `NEXT_PUBLIC_APP_URL`
- **¿Qué hace?:** Define la URL base pública de la aplicación. Se utiliza para generar URLs absolutas en redirecciones de pagos, notificaciones por correo y callbacks de recuperación de contraseña.
- **¿De dónde se saca?:**
  - En Preproducción/Desarrollo: La URL asignada por Vercel (`https://storebasc.vercel.app`).
  - En Producción Real: Tu dominio propio (`https://espiritananda.com`).

### `NEXT_PUBLIC_DEMO_MODE`
- **¿Qué hace?:** Controla el modo de operación dual (`true` / `false`). Cuando es `true` desactiva la protección del panel `/admin` para evaluar la app sin credenciales reales. Con `false` (producción), el acceso exige login con rol admin.
- **¿De dónde se saca?:** Definido manualmente: `"true"` para QA/preproducción, `"false"` para lanzamiento final.

### `NEXT_PUBLIC_PAYMENT_PROVIDER`
- **¿Qué hace?:** Especifica el proveedor de pagos activo (`manual` para transferencias Nequi/Daviplata/Bancolombia o `mercadopago` para pasarela automática Checkout Pro).
- **¿De dónde se saca?:** Definido manualmente (`"manual"` o `"mercadopago"`).

### `NEXT_PUBLIC_WHATSAPP_NUMBER`
- **¿Qué hace?:** Número telefónico con código de país (sin espacios ni signo `+`) usado en los botones de contacto WhatsApp de la web y el panel.
- **¿De dónde se saca?:** Número telefónico del negocio (ej: `573000000000`).

---

## 💳 2. Mercado Pago Pasarela

### `MERCADOPAGO_ACCESS_TOKEN`
- **¿Qué hace?:** Access Token para crear preferencias de pago (Checkout Pro) y consultar pagos desde webhooks.
- **¿De dónde se saca?:**
  1. [Dashboard Mercado Pago Developers](https://www.mercadopago.com.co/developers/panel).
  2. Seleccionar o crear la aplicación.
  3. **Credenciales de prueba** (Sandbox `TEST-...`) o **Credenciales de producción** (`APP_USR-...`).
  4. Copiar el **Access Token**.

### `MERCADOPAGO_WEBHOOK_SECRET`
- **¿Qué hace?:** Secreto usado para validar la firma `x-signature` de los webhooks IPN (HMAC SHA-256). Si está vacío, las notificaciones no se firman.
- **¿De dónde se saca?:** Generado en la pestaña **Notificaciones Webhooks** de la aplicación en Mercado Pago Developers.

---

## 🗄️ 3. Base de Datos & Backend (Supabase PostgreSQL)

### `NEXT_PUBLIC_SUPABASE_URL`
- **¿Qué hace?:** Endpoint HTTPS del proyecto Supabase.
- **¿De dónde se saca?:**
  1. [Supabase Dashboard](https://supabase.com/dashboard) → proyecto **AnandaStore**.
  2. **Project Settings** ⚙️ → **API** → **Project URL**.

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **¿Qué hace?:** Clave pública anónima (prefijo `sb_publishable_`). Permite lecturas públicas bajo las políticas RLS. Segura para el navegador.
- **¿De dónde se saca?:** **Project Settings → API → Project API Keys** → `anon` `publishable`.

### `SUPABASE_SERVICE_ROLE_KEY`
- **¿Qué hace?:** Clave maestra de servidor (prefijo `sb_secret_`). Bypass de RLS para el backend (`src/lib/supabase/server.ts`). **NUNCA** se expone al navegador.
- **¿De dónde se saca?:** **Project Settings → API → Project API Keys** → `service_role` `secret`.
- ⚠️ **Requisito de seguridad:** la clave configurada DEBE ser una `sb_secret_...`. No usar la publishable en esta variable (dejaría expuestas las políticas RLS de escritura).

---

## 🔐 4. Autenticación (NextAuth v5 — Email & Contraseña)

### `AUTH_SECRET`
- **¿Qué hace?:** Llave de cifrado simétrica aleatoria para firmar cookies de sesión y tokens JWT.
- **¿De dónde se saca?:** Generar desde la terminal: `openssl rand -base64 32` (o `npx auth secret`). Mínimo 32 caracteres.

### `AUTH_TRUST_HOST`
- **¿Qué hace?:** Permite que NextAuth v5 confíe en el host en entornos serverless (Vercel).
- **¿De dónde se saca?:** Fijo: `"true"`.

### `ADMIN_EMAILS`
- **¿Qué hace?:** Lista separada por comas de correos autorizados como administradores del panel (`/admin/*`) cuando no existen en la tabla `admin_users`.
- **¿De dónde se saca?:** Los correos del equipo (ej: `diegoillers@gmail.com,lina@espiritananda.com`).

---

## 📅 5. Agendamiento & Google Calendar API

### `NEXT_PUBLIC_CALENDAR_ID`
- **¿Qué hace?:** Identificador de la agenda de Google Calendar donde se leen franjas ocupadas y se crean las citas.
- **¿De dónde se saca?:**
  1. Google Calendar → **Configuración** ⚙️ → el calendario de citas.
  2. Sección **Integrar el calendario** → **ID del calendario** (ej: `lina@espiritananda.com`).

### `GOOGLE_CLIENT_EMAIL`
- **¿Qué hace?:** Email de la Service Account de Google Cloud usada por el servidor para gestionar la agenda sin intervención humana.
- **¿De dónde se saca?:**
  1. [Google Cloud Console](https://console.cloud.google.com/) → **IAM y administración → Cuentas de servicio**.
  2. **Crear cuenta de servicio** (ej: `ananda-calendar-bot`).
  3. Copiar el correo generado (ej: `ananda-calendar-bot@proyecto.iam.gserviceaccount.com`).
  4. ⚠️ **IMPORTANTE:** Compartir el calendario de Lina con este correo en *Configuración → Compartir con determinadas personas* con permiso **"Hacer cambios en eventos"**.

### `GOOGLE_PRIVATE_KEY`
- **¿Qué hace?:** Clave privada RSA PEM de la Service Account para firmar las peticiones a Google Calendar API.
- **¿De dónde se saca?:**
  1. En la cuenta de servicio → pestaña **Claves** → **Agregar clave → Crear clave nueva → JSON**.
  2. Copiar el contenido del campo `"private_key"` (con `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`).
  3. ⚠️ **En Vercel:** pegar como una sola línea con `\n` literales (el código los convierte a saltos de línea).

---

## 📧 6. Correos Transaccionales (SMTP / Nodemailer)

### `SMTP_HOST`
- **¿Qué hace?:** Servidor SMTP de salida.
- **¿De dónde se saca?:** Gmail / Google Workspace → `smtp.gmail.com`. Resend → `smtp.resend.com`.

### `SMTP_PORT`
- **¿Qué hace?:** Puerto de conexión SMTP.
- **¿De dónde se saca?:** `587` (TLS) o `465` (SSL).

### `SMTP_USER`
- **¿Qué hace?:** Correo emisor.
- **¿De dónde se saca?:** El correo Gmail que emite las notificaciones.

### `SMTP_PASSWORD`
- **¿Qué hace?:** Contraseña de aplicación de 16 caracteres.
- **¿De dónde se saca?:**
  1. Activar **Verificación en dos pasos** en la cuenta de Google.
  2. [Google App Passwords](https://myaccount.google.com/apppasswords) → crear clave (ej. `AnandaStore Nodemailer`).
  3. Copiar la cadena de 16 caracteres (sin espacios).

### `SMTP_FROM`
- **¿Qué hace?:** Remitente visible del correo.
- **¿De dónde se saca?:** `"Espíritu Ananda <no-reply@espiritananda.com>"`.

---

## 💳 7. Cuentas Bancarias para Pagos Manuales

### `NEXT_PUBLIC_NEQUI_NUMBER`, `NEXT_PUBLIC_DAVIPLATA_NUMBER`, `NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT`
- **¿Qué hacen?:** Datos de cuentas para el flujo de pago manual (transferencias y comprobantes).
- **¿De dónde se sacan?:** Proporcionados por Lina (ej: `300 123 4567`, `Ahorros 123-456789-00`).

---

## ⏱️ 8. Seguridad de Tareas Programadas (Cron Jobs)

### `CRON_SECRET`
- **¿Qué hace?:** Cadena de autenticación requerida como `Authorization: Bearer <CRON_SECRET>` para autorizar `/api/cron/cleanup` y `/api/cron/orders-cleanup`.
- **¿De dónde se saca?:** Cadena alfanumérica segura generada por ti. Se configura en **Vercel Dashboard → Settings → Environment Variables** y en `vercel.json` para las invocaciones del cron.

---

## 🧹 Variables eliminadas / obsoletas (no configurar)

| Variable | Motivo |
| :--- | :--- |
| `NEXT_PUBLIC_PAYMENT_MODE` | Reemplazada por `NEXT_PUBLIC_PAYMENT_PROVIDER` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | El login usa credenciales propias (NextAuth Credentials + Supabase Auth), no OAuth de Google |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | El código real usa `GOOGLE_CLIENT_EMAIL` / `GOOGLE_PRIVATE_KEY` |
| `MERCADOPAGO_PUBLIC_KEY` | No se usa (Checkout Pro usa solo Access Token); reservada para Bricks futuro |
| `NEXT_PUBLIC_APP_NAME` | Sin uso en el código actual |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | Nombres de NextAuth v4; v5 usa `AUTH_SECRET` (+ `AUTH_TRUST_HOST`) |
| `NEXTAUTH_SECRET` | Ver arriba |
| `DEMO_MODE` (sin prefijo) | Reemplazada por `NEXT_PUBLIC_DEMO_MODE` |
| `NEXT_PUBLIC_BYPASS_AUTH` | Eliminada; el modo demo se controla solo con `NEXT_PUBLIC_DEMO_MODE` |
| `PAYMENT_PROVIDER` (sin prefijo) | Reemplazada por `NEXT_PUBLIC_PAYMENT_PROVIDER` |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Aliases legacy; usar `SMTP_USER` / `SMTP_PASSWORD` |
| `ADMIN_PASSWORD` | Nunca existió en el código |
