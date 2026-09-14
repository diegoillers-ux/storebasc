# Checklist Demo Segura

## Antes de compartir demo
1. Usar entorno de demo, no produccion real.
2. Quitar datos personales y marca de clientes anteriores.
3. Usar correos de prueba.
4. Verificar que no exista `.env.local` en repo compartido.
5. Verificar que no existan JSON de credenciales en carpetas publicas.

## En configuracion
1. Definir `ADMIN_EMAILS` solo para cuenta demo.
2. Usar calendario demo, no calendario real del negocio.
3. Usar `CRON_SECRET` separado para demo.
4. Revisar que variables sensibles esten solo en plataforma (no en codigo).

## En presentacion
1. Mostrar flujo funcional completo (cliente -> admin -> confirmacion).
2. No mostrar keys, IDs sensibles o paneles de cloud.
3. No mostrar correos o numeros reales.
4. Usar texto "ejemplo" en pagos y cuentas.

## Al finalizar demo con prospecto
1. Revocar accesos temporales de terceros.
2. Cambiar secretos si hubo exposicion accidental.
3. Limpiar reservas demo.
4. Archivar evidencia comercial (video, cotizacion, fecha).

