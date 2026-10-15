# Entornos y credenciales

Fuente de nombres: `.env.example` y lecturas de `process.env` en el código. Los valores configurados remotamente no fueron inspeccionados.

| Integración | Variables principales | Verificación pendiente |
|---|---|---|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Estado proyecto, esquema/migraciones, RLS y permisos |
| Auth | `AUTH_SECRET`, `AUTH_TRUST_HOST`, `ADMIN_EMAILS` | Login, registro, OTP, recuperación y roles |
| Mercado Pago | `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `NEXT_PUBLIC_PAYMENT_PROVIDER` | Sandbox, firma, reintentos y conciliación |
| Comprobantes | `BLOB_READ_WRITE_TOKEN` | Almacenamiento privado y descarga con autorización |
| Google Calendar | `NEXT_PUBLIC_CALENDAR_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` | Cuenta, calendario, freebusy y creación/cancelación |
| SMTP | Variables SMTP de `.env.example` | Servidor autorizado de pruebas; recepción y fallos |
| Cron | `CRON_SECRET` | Rechazo sin autorización y limpieza en entorno controlado |
| URL/negocio | `NEXT_PUBLIC_APP_URL`, cuentas manuales y WhatsApp | Datos del negocio y URL desplegada |

## Separación

- Desarrollo y sandbox: base y cuentas de prueba, credenciales propias; nunca usar pagos reales por defecto.
- Producción: requiere aceptación explícita del despliegue, datos/credenciales del negocio y `NEXT_PUBLIC_DEMO_MODE=false`.
- Smoke local: secreto de Auth artificial solo para arrancar el servidor; no usa credenciales de producción ni configura modo demo.
- Un build sin credenciales puede renderizar catálogos de ejemplo. No usar ese resultado como evidencia de conexión ni desplegarlo como catálogo comercial.

## Secretos

No copiar credenciales desde el historial o documentación. Hubo un reporte anterior de exposición Google: verificar revocación/rotación con el propietario antes del piloto. La búsqueda limitada de patrones en el árbol actual no prueba que el historial esté limpio ni que un secreto haya sido revocado.

La configuración MCP de `.agents/` es un ejemplo para los arneses compatibles; no instala servidores ni transmite credenciales automáticamente.
