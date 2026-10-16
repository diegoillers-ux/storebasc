# Entornos e integraciones

Nombres desde `.env.example`; valores remotos no inspeccionados.

| Integración | Variables | Estado |
|---|---|---|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY` | Proyecto, esquema aplicado, RLS: desconocidos |
| Auth | `AUTH_SECRET`, `AUTH_TRUST_HOST`, `ADMIN_EMAILS` | Login real, OTP, roles: sin probar |
| Mercado Pago | `MERCADOPAGO_ACCESS_TOKEN`, `WEBHOOK_SECRET`, `NEXT_PUBLIC_PAYMENT_PROVIDER` | Sandbox/prod, firma, reintentos: sin probar |
| Comprobantes | `BLOB_READ_WRITE_TOKEN` | Bucket y descarga autorizada: sin probar |
| Google Calendar | `NEXT_PUBLIC_CALENDAR_ID`, `GOOGLE_CLIENT_EMAIL/PRIVATE_KEY` | Cuenta y calendario: sin probar; rotación pendiente |
| SMTP | `SMTP_*`, cuentas Nequi/Daviplata/Bancolombia, WhatsApp | Envío/recepción: sin probar |
| Cron | `CRON_SECRET` | Ejecución remota: sin probar |
| App/negocio | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_DEMO_MODE` | Dominio 200, commit/entorno: desconocidos |

## Recursos locales ya disponibles (no preguntar, usar)

- `.env` presente e ignorado; 3 archivos de credenciales del proveedor
  presentes e ignorados (nombres verificados, contenido jamás leído).
- MCP configurado en `.agents/mcp_config.json`: servidores `mercadopago` y
  `mercadolibre` (solo URLs, sin secretos en el repo).
- El agente usa estos recursos sin pedirlos al propietario; nunca los muestra,
  versiona ni transmite fuera de las llamadas necesarias.

## Reglas

- Local/sandbox: credenciales de prueba; nunca pagos reales por defecto.
- Producción: solo con aceptación explícita. El modo demo falla cerrado
  (`isDemoMode()` devuelve `false` con `NODE_ENV=production`), por lo que
  `NEXT_PUBLIC_DEMO_MODE=true` se ignora aunque esté mal configurado.
- Secretos (3 archivos en raíz + `.env*`) siempre locales e ignorados; nunca en
  Git. Su contenido no se lee ni se muestra; su presencia se registra redactada.
- Un build sin credenciales rinde catálogos de ejemplo: no es evidencia de
  conexión ni material desplegable como catálogo comercial.
