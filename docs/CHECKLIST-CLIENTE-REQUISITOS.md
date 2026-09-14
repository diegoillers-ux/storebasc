# 📋 Checklist de Requisitos — Lina (Espíritu Ananda)

> **Propósito:** reunir TODO lo que el cliente debe entregar para activar
> correos, calendario, pagos reales y el dominio propio en producción.
>
> **Estado:** este documento se entregará cuando el desarrollo en pruebas
> reales esté completo. Mientras tanto, las pruebas se realizan con datos
> del equipo técnico.
>
> Marca cada casilla ✔ cuando entregues el requisito.

---

## 1. ✉️ Correo Gmail (confirmaciones, códigos OTP y recibos)

**Qué necesitamos de ti:** un correo Gmail de trabajo con **Verificación en 2 pasos** activada y una **Contraseña de Aplicación**.

Pasos (toma ~10 minutos):
1. Entra a `https://myaccount.google.com/security` → activa **Verificación en 2 pasos**.
2. Entra a `https://myaccount.google.com/apppasswords`.
3. Nombre de la app: `anandastore` → **Crear**.
4. Copia el código de 16 caracteres (solo se muestra una vez).

**Debes entregarnos:**
- [ ] Correo Gmail de la marca (ej. `lina@...gmail.com`)
- [ ] La **Contraseña de Aplicación** (16 caracteres)

> **Alternativa gratuita (recomendada si conectamos espiritananda.com):**
> **Resend** (`resend.com`) — 3,000 correos/mes gratis, mejor entregabilidad
> y el remitente es `@espiritananda.com` (verifica DKIM/SPF del dominio).

---

## 2. 📅 Google Calendar (agenda automática de citas)

**Qué necesitamos de ti:** acceso de una **Service Account** a tu calendario personal.

Pasos (requiere una cuenta Google Cloud, puedes usar la del correo):
1. `https://console.cloud.google.com` → crea un **Proyecto** (ej. `ananda-calendar`).
2. Menú **APIs y servicios → Biblioteca** → habilita **Google Calendar API**.
3. Menú **APIs y servicios → Credenciales → Crear credenciales → Cuenta de servicio** → nómbrala `ananda-service` → **Crear**.
4. En la cuenta creada: **Claves → Agregar clave → Crear nueva clave → JSON** → descarga el archivo.
5. En `https://calendar.google.com` (tu correo personal) → **Configuración del calendario → Compartir con personas** → agrega el `client_email` de la Service Account con permiso **"Hacer cambios en eventos"**.

**Debes entregarnos:**
- [ ] El `client_email` de la Service Account (ej. `ananda-service@...iam.gserviceaccount.com`)
- [ ] La `private_key` completa del JSON
- [ ] El **ID del calendario** (Configuración → Integrar calendario → Dirección del calendario, ej. `lina@espiritananda.com`)

---

## 3. 🗄️ Supabase (base de datos)

**Qué necesitamos de ti:** acceso al proyecto o autorización para crear uno.

Pasos:
1. `https://supabase.com` → proyecto **AnandaStore**.
2. **Settings → API keys**: copia **Project URL**, **anon/publishable key** y **service_role key** (prefijo `sb_secret_...`).

**Debes entregarnos:**
- [ ] Project URL
- [ ] Anon / Publishable key (`sb_publishable_...`)
- [ ] **Service Role key** (`sb_secret_...`) — alto privilegio, solo servidor

---

## 4. 💳 Mercado Pago (pasarela real)

**Qué necesitamos de ti:** cuenta de Mercado Pago **Colombia habilitada para cobrar** (usuario validado y datos de negocio completos).

Pasos:
1. `https://www.mercadopago.com.co` → **Tu negocio → Configuración** → completa datos fiscales y bancarios (es requisito para cobrar en producción).
2. `https://www.mercadopago.com.co/developers` → **Mis aplicaciones → Crear aplicación**.
3. Copia **Access Token** (`APP_USR-...`) y **Public Key** (`APP_USR-...`).
4. Configura un **Webhook Secret** en la aplicación (recomendado).

**Debes entregarnos:**
- [ ] Access Token de PRODUCCIÓN (`APP_USR-...`)
- [ ] Public Key de PRODUCCIÓN (`APP_USR-...`)
- [ ] Webhook Secret
- [ ] Confirmación de cuenta habilitada para cobrar

> Prueba final: se hará un pago real de $1.000 COP para validar el flujo.

---

## 5. 🌐 Dominio `espiritananda.com`

**Qué necesitamos de ti:** acceso al panel del registrador donde compraste el dominio (GoDaddy, Namecheap, Hostinger, etc.).

Pasos:
1. En Vercel se agrega el dominio; el panel entrega los registros DNS exactos.
2. Actualiza esos registros en el registrador.
3. El certificado SSL se emite automáticamente (~24 h).

**Debes entregarnos:**
- [ ] Acceso al panel del registrador (o invitación)
- [ ] Confirmación de dominio activo y sin bloqueo

---

## 6. 📱 WhatsApp comercial

**Qué necesitamos de ti:**
- [ ] Número de WhatsApp del negocio con código de país (ej. `573001234567` — Colombia)

> Se usa para: botón de contacto en la web, avisos de citas y confirmaciones.

---

## 7. 🏦 Datos para pago manual (comprobantes)

**Qué necesitamos de ti:**
- [ ] Número Nequi (ej. `300 123 4567`)
- [ ] Número Daviplata
- [ ] Cuenta Bancolombia (tipo + número)
- [ ] Correo(s) del equipo que recibe los comprobantes de pago (ej. `lina@espiritananda.com`)

---

## 8. 🎨 Branding y configuración de servicios

**Qué necesitamos de ti:**
- [ ] Logo PNG transparente **512x512** (icono de app/PWA)
- [ ] Favicon (si difiere del logo)
- [ ] **Horarios de atención** por día (ej. Lun-Sáb 9:00-18:00)
- [ ] **Duración de cada servicio** (ej. tarot 30 min, carta natal 90 min)

---

## 📊 Resumen: requisito → variables

| Requisito | Lo entregas tú | Variable(s) |
| :--- | :--- | :--- |
| Correo Gmail + App Password | Usuario + código 16 dígitos | `SMTP_USER`, `SMTP_PASSWORD` |
| Service Account Google | client_email + private_key | `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` |
| ID de calendario | email del calendario | `NEXT_PUBLIC_CALENDAR_ID` |
| Supabase | URL + anon + service_role | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Mercado Pago | 2 tokens `APP_USR` + secret | `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`, `MERCADOPAGO_WEBHOOK_SECRET` |
| Dominio | acceso al registrador | Panel Vercel (DNS + SSL) |
| WhatsApp | número con código país | `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Cuentas bancarias | números | `NEXT_PUBLIC_NEQUI_NUMBER`, `NEXT_PUBLIC_DAVIPLATA_NUMBER`, `NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT` |

---

## ⚠️ Seguridad

- **NUNCA** compartas claves por correo o chat abierto. Entrega las credenciales por un canal seguro (gestor de contraseñas compartido o archivo cifrado).
- `SUPABASE_SERVICE_ROLE_KEY` y el Access Token de MP son de **máximo privilegio**: solo viven en el servidor (Vercel), nunca en el navegador.
