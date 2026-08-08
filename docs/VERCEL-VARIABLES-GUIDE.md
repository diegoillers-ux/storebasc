# 🔑 Manual Oficial de Variables de Entorno — AnandaStore V2

Este documento detalla todas las variables de entorno utilizadas en **AnandaStore V2**, su función dentro de la arquitectura de la aplicación y el procedimiento exacto paso a paso para obtener cada clave o credencial desde las consolas oficiales (Google Cloud, Supabase, Vercel, Gmail).

---

## 🏛️ 1. Configuración General & Modos de la Aplicación

### `NEXT_PUBLIC_APP_URL`
- **¿Qué hace?:** Define la URL base pública de la aplicación. Se utiliza para generar URLs absolutas en callbacks de NextAuth, notificaciones por correo, redirecciones de pago y metadatos SEO.
- **¿De dónde se saca?:**
  - En Preproducción/Desarrollo: La URL asignada por Vercel (`https://storebasc.vercel.app`).
  - En Producción Real: Tu dominio propio (`https://espiritananda.com`).

### `NEXT_PUBLIC_APP_NAME`
- **¿Qué hace?:** Nombre público comercial que aparece en la barra de navegación, pie de página, emails y títulos de pestañas.
- **¿De dónde se saca?:** Definido manualmente según la marca (ej: `Espíritu Ananda` o `Espíritu Ananda (Preproducción)`).

### `NEXT_PUBLIC_DEMO_MODE`
- **¿Qué hace?:** Controla el modo de operación dual (`true` / `false`). Cuando es `true`, activa el botón `⚡ Ingreso Directo Admin (Preproducción)` en `/login` para evaluar la app sin credenciales reales y simula confirmaciones de citas/pagos.
- **¿De dónde se saca?:** Definido manualmente: `"true"` para preproducción/QA, `"false"` para lanzamiento final comercial.

### `NEXT_PUBLIC_PAYMENT_MODE`
- **¿Qué hace?:** Especifica la modalidad de pago predeterminada en la tienda y agendamiento (`manual` para Nequi/Daviplata/Bancolombia o `gateway` para pasarela automática).
- **¿De dónde se saca?:** Definido manualmente (`"manual"` o `"gateway"`).

### `NEXT_PUBLIC_WHATSAPP_NUMBER`
- **¿Qué hace?:** Número telefónico con código de país (sin espacios ni signo `+`) que recibe las confirmaciones de pedidos y recibos de los clientes vía WhatsApp.
- **¿De dónde se saca?:** Número telefónico de Lina (ej: `573000000000`).

---

## 🗄️ 2. Base de Datos & Backend (Supabase PostgreSQL)

### `NEXT_PUBLIC_SUPABASE_URL`
- **¿Qué hace?:** Endpoint HTTPS del proyecto en Supabase. Utilizado por el cliente Web y los servicios del servidor.
- **¿De dónde se saca?:**
  1. Entra a la consola de [Supabase Dashboard](https://supabase.com/dashboard).
  2. Selecciona tu proyecto (`AnandaStore`).
  3. Ve a **Project Settings** (icono de engranaje ⚙️ en la barra lateral izquierda) ➔ **API**.
  4. En la sección **Project URL**, copia la URL (ej: `https://abcdefgh.supabase.co`).

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **¿Qué hace?:** Llave pública anónima de Supabase. Permite al cliente realizar consultas de lectura públicas bajo las políticas de seguridad RLS.
- **¿De dónde se saca?:**
  1. En la misma pantalla de **Supabase Dashboard ➔ Project Settings ➔ API**.
  2. En la sección **Project API Keys**, copia la clave etiquetada como `anon` `public`.

### `SUPABASE_SERVICE_ROLE_KEY`
- **¿Qué hace?:** Llave maestra administrativa de servidor (Service Role Key). Bypass completo de RLS para operaciones privileged en endpoints API backend (`src/lib/supabase/server.ts`). NUNCA se expone al cliente.
- **¿De dónde se saca?:**
  1. En **Supabase Dashboard ➔ Project Settings ➔ API**.
  2. En **Project API Keys**, copia la clave etiquetada como `service_role` `secret`.

---

## 🔐 3. Autenticación & Control de Acceso (NextAuth v5 - Email & Contraseña)

### `NEXTAUTH_URL`
- **¿Qué hace?:** URL de origen requerida por NextAuth v5 para validar las solicitudes de inicio de sesión y construir las URLs de redirección.
- **¿De dónde se saca?:** Debe ser idéntica a `NEXT_PUBLIC_APP_URL` (`https://storebasc.vercel.app`).

### `NEXTAUTH_SECRET`
- **¿Qué hace?:** Llave de cifrado simétrico aleatoria para firmar y proteger las cookies de sesión y tokens JWT del panel administrativo.
- **¿De dónde se saca?:**
  - Generar desde la terminal ejecutando: `npx auth secret` o `openssl rand -base64 32`.
  - Es una cadena aleatoria de al menos 32 caracteres.

### `ADMIN_PASSWORD` (Opcional)
- **¿Qué hace?:** Contraseña de acceso maestro para los administradores. Si no se especifica, el sistema toma como valor predeterminado seguro `ananda2026!`.
- **¿De dónde se saca?:** Definido manualmente en las variables de entorno de Vercel.

### `ADMIN_EMAILS`
- **¿Qué hace?:** Lista separada por comas de correos autorizados a ingresar al panel de administración (`/admin/*`).
- **¿De dónde se saca?:** Escribir los correos de Lina y administradores (ej: `lina@espiritananda.com,diegoillers@gmail.com`).

*Nota: Gracias al proveedor de credenciales directas (Email + Contraseña), ya **NO es obligatorio** configurar `GOOGLE_CLIENT_ID` ni `GOOGLE_CLIENT_SECRET` en Google Cloud Console para el inicio de sesión.*

---

## 📅 4. Agendamiento & Google Calendar API

### `NEXT_PUBLIC_CALENDAR_ID`
- **¿Qué hace?:** Identificador de la agenda de Google Calendar en la que se leen las franjas horarias ocupadas y se agendan automáticamente las citas del cliente.
- **¿De dónde se saca?:**
  1. Abrir Google Calendar en la cuenta de Lina.
  2. Ir a **Configuración** ⚙️ ➔ Seleccionar el calendario de citas bajo *Configuración de mis calendarios*.
  3. Desplazarse a la sección **Integrar el calendario**.
  4. Copiar el **ID del calendario** (ej: `lina@espiritananda.com` o `c_12345...@group.calendar.google.com`).

### `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- **¿Qué hace?:** Email de la cuenta de servicio robot de Google Cloud utilizada para gestionar la agenda sin requerir intervención humana.
- **¿De dónde se saca?:**
  1. En [Google Cloud Console](https://console.cloud.google.com/), ir a **IAM y administración** ➔ **Cuentas de servicio**.
  2. Haz clic en **Crear cuenta de servicio** (Nombre: `ananda-calendar-bot`).
  3. Copiar el correo generado (ej: `ananda-calendar-bot@proyecto.iam.gserviceaccount.com`).
  4. ⚠️ **IMPORTANTE:** Debes ir a Google Calendar ➔ Configuración de la agenda ➔ *Compartir con determinadas personas* ➔ Añadir este correo de Service Account con permiso *"Hacer cambios en eventos"*.

### `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- **¿Qué hace?:** Clave privada RSA PEM para firmar digitalmente las peticiones de la Service Account a la API de Google Calendar.
- **¿De dónde se saca?:**
  1. En la cuenta de servicio creada en Google Cloud Console, ve a la pestaña **Claves**.
  2. Haz clic en **Agregar clave** ➔ **Crear clave nueva** ➔ Selecciona formato **JSON**.
  3. Abre el archivo JSON descargado en tu equipo y copia únicamente el contenido del campo `"private_key"` (incluyendo `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`).

---

## 📧 5. Correos Transaccionales (SMTP / Nodemailer)

### `SMTP_HOST`
- **¿Qué hace?:** Dirección del servidor de salida SMTP para el envío de correos.
- **¿De dónde se saca?:** Para cuentas de Gmail / Google Workspace usar `smtp.gmail.com`.

### `SMTP_PORT`
- **¿Qué hace?:** Puerto de conexión cifrada SMTP.
- **¿De dónde se saca?:** Usar `587` (TLS) o `465` (SSL).

### `SMTP_USER`
- **¿Qué hace?:** Dirección de correo electrónico emisora.
- **¿De dónde se saca?:** El correo corporativo o Gmail de notificaciones de Lina (ej: `no-reply@espiritananda.com`).

### `SMTP_PASSWORD`
- **¿Qué hace?:** Contraseña de aplicación de 16 letras para autenticar el envío desde Nodemailer.
- **¿De dónde se saca?:**
  1. Entrar a la cuenta de Google de emitiendo los correos y ve a [Mi Cuenta de Google](https://myaccount.google.com/).
  2. Ve a la pestaña **Seguridad**.
  3. Asegúrate de tener activada la **Verificación en dos pasos**.
  4. En el buscador de la cuenta, escribe *"Contraseñas de aplicaciones"* o entra a [Google App Passwords](https://myaccount.google.com/apppasswords).
  5. Crea una clave llamada *"AnandaStore Nodemailer"*.
  6. Copia la cadena de 16 caracteres generada (sin espacios).

### `SMTP_FROM`
- **¿Qué hace?:** Cadena de formato de emisor para la bandeja de entrada del destinatario.
- **¿De dónde se saca?:** Definir con la sintaxis: `"Espíritu Ananda <no-reply@espiritananda.com>"`.

---

## 💳 6. Cuentas Bancarias para Pagos Manuales

### `NEXT_PUBLIC_NEQUI_NUMBER`
- **¿Qué hace?:** Número de celular Nequi para recibir transferencias directas.
- **¿De dónde se saca?:** Proporcionado por Lina (ej: `300 123 4567`).

### `NEXT_PUBLIC_DAVIPLATA_NUMBER`
- **¿Qué hace?:** Número celular Daviplata para transferencias.
- **¿De dónde se saca?:** Proporcionado por Lina (ej: `300 123 4567`).

### `NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT`
- **¿Qué hace?:** Detalles de la cuenta bancaria Bancolombia.
- **¿De dónde se saca?:** Proporcionado por Lina (ej: `Ahorros 123-456789-00`).

---

## ⏱️ 7. Seguridad de Tareas Programadas (Cron Jobs)

### `CRON_SECRET`
- **¿Qué hace?:** Cadena de autenticación requerida en el encabezado `Authorization: Bearer <CRON_SECRET>` para autorizar la ejecución periódica de la API `/api/cron/cleanup` (liberación de citas no pagadas).
- **¿De dónde se saca?:**
  - Cadena de texto alfanumérica segura generada por ti (ej: `secreto_seguro_para_invocar_cron_cleanup`).
  - Se configura en **Vercel Dashboard ➔ Settings ➔ Environment Variables**.
