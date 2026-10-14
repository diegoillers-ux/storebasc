# Roadmap de continuación

Actualizado: 2026-10-13. El estado exacto está en PROJECT-STATE.md; este archivo define prioridades, no fechas prometidas.

| Prioridad | Resultado | Criterio de salida |
|---|---|---|
| P0 | Consolidación SB-001 | PR con avances V2, artefactos retirados, instrucciones comunes y evidencias honestas |
| P0 | Verificaciones verdes | Resolver los 74 errores de lint sin desactivar reglas; ejecutar smoke Chromium y configurar controles obligatorios |
| P0 | Entorno recuperado | Ubicar/recrear despliegue de pruebas; rutas responden correctamente; credenciales remediadas y secretos segregados |
| P1 | Disponibilidad fiable | Persistir horas/bloqueos, cubrir solapes completos, reservar atómicamente y probar UTC/Bogotá |
| P1 | Pagos/pedidos fiables | E2E sandbox y manual: aprobar/rechazar, stock, reintentos, firma webhook y recuperación de estados parciales |
| P1 | Operación Ananda | Auth/roles auditados, métricas reales, módulos incompletos ocultos, cron y notificaciones probados |
| P2 | Storebasc Core configurable | Configuración de negocio, branding, campos particulares y módulos; segundo negocio desde el mismo código sin editar fuentes |
| P3 | Validación comercial | 2–3 clientes con instancias separadas, onboarding repetible y costos medidos |
| P4 | Evaluación SaaS | Decisión sustentada por operación real sobre aislamiento, multitenencia, soporte y facturación |

Mercado Pago/manual se mantienen. PWA y optimizaciones móviles previamente canceladas no se reactivan en esta consolidación. Rifas/IA requieren necesidad comercial antes de implementar.
