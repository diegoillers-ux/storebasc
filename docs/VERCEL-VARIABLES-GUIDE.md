# Estructura y Limpieza de Variables de Entorno — Vercel (AnandaStore V2)

**Proyecto:** AnandaStore V2  
**Fecha:** 25 de Julio, 2026  
**Tecnología:** Next.js 16 + Firebase Firestore + NextAuth v5  

---

## 🔑 1. Autenticación en Vercel CLI

Para sincronizar o listar tus variables mediante Vercel CLI, ingresa desde tu navegador a la siguiente dirección de autenticación de dispositivo:

- 🔗 **URL de Autenticación:** [https://vercel.com/oauth/device?user_code=LZFJ-KZGB](https://vercel.com/oauth/device?user_code=LZFJ-KZGB)
- 🔑 **Código de Dispositivo:** `LZFJ-KZGB`

---

## 🧹 2. Variables Obsoletas a ELIMINAR (Limpieza de V1)

Las siguientes variables pertenecen a versiones anteriores o servicios migrados y **DEBEN SER ELIMINADAS** de Vercel para evitar conflictos y mantener un entorno limpio:

| Variable Obsoleta | Motivo de Eliminación |
| :--- | :--- |
| ❌ `DATABASE_URL` | Migrado de PostgreSQL / Prisma ORM a **Firebase Cloud Firestore**. |
| ❌ `POSTGRES_URL` | Migrado de PostgreSQL a Cloud Firestore. |
| ❌ `NEXT_PUBLIC_BYPASS_AUTH` | Reemplazado por `NEXT_PUBLIC_DEMO_MODE` en la V2. |
| ❌ `CLOUDINARY_CLOUD_NAME` | Reemplazado por Vercel Blob / almacenamiento directo de Firebase. |
| ❌ `CLOUDINARY_API_KEY` | Reemplazado por Vercel Blob / almacenamiento directo de Firebase. |
| ❌ `CLOUDINARY_API_SECRET` | Reemplazado por Vercel Blob / almacenamiento directo de Firebase. |

*Comandos para eliminar variables obsoletas desde Vercel CLI:*
```bash
npx vercel env rm DATABASE_URL production --yes
npx vercel env rm POSTGRES_URL production --yes
npx vercel env rm NEXT_PUBLIC_BYPASS_AUTH production --yes
npx vercel env rm CLOUDINARY_CLOUD_NAME production --yes
npx vercel env rm CLOUDINARY_API_KEY production --yes
npx vercel env rm CLOUDINARY_API_SECRET production --yes
```

---

## 📋 3. Matriz Estructurada de Variables Requeridas (V2)

### A. Configuración General de la Aplicación
```env
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"
NEXT_PUBLIC_APP_NAME="Espíritu Ananda"
NEXT_PUBLIC_DEMO_MODE="false"               # 'true' para vista previa/demo, 'false' para producción real
NEXT_PUBLIC_PAYMENT_MODE="manual"           # 'manual' (Nequi/Bancolombia) o 'gateway' (Wompi)
NEXT_PUBLIC_WHATSAPP_NUMBER="573000000000"
```

### B. Autenticación & Control de Acceso Admin (NextAuth v5)
```env
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="clave_secreta_jwt_de_32_caracteres_minimo"
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
ADMIN_EMAILS="lina@espiritananda.com,admin@espiritananda.com"
```

### C. Base de Datos Serverless (Firebase Cloud Firestore)
```env
# SDK de Servidor (Firebase Admin)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"..."}'

# SDK Web de Cliente
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu-proyecto"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu-proyecto.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcde12345"
```

### D. Google Calendar & Agenda Astral
```env
NEXT_PUBLIC_CALENDAR_ID="anandastore@gmail.com"
GOOGLE_SERVICE_ACCOUNT_EMAIL="ananda-calendar@tu-proyecto.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### E. Emailing (SMTP / Notificaciones de Venta)
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="no-reply@espiritananda.com"
SMTP_PASSWORD="contrasena_de_aplicacion_gmail"
SMTP_FROM="Espíritu Ananda <no-reply@espiritananda.com>"
```

### F. Datos de Cuentas para Pagos Manuales & Pasarela Wompi
```env
NEXT_PUBLIC_NEQUI_NUMBER="300 123 4567"
NEXT_PUBLIC_DAVIPLATA_NUMBER="300 123 4567"
NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT="Ahorros 123-456789-00"

# Pasarela Wompi (Opcional)
WOMPI_PUBLIC_KEY="pub_prod_..."
WOMPI_PRIVATE_KEY="prv_prod_..."
WOMPI_WEBHOOK_SECRET="wompi_secret_..."
```

### G. Cron Job & Inteligencia Artificial
```env
CRON_SECRET="secreto_seguro_para_invocar_cron_cleanup"
GEMINI_API_KEY="AIzaSy..."
```
