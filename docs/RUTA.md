# Ruta (prioridades, no fechas)

| Prioridad | Resultado | Criterio de salida |
|---|---|---|
| P0 | Estado y accesos | Lectura Vercel/Supabase; commit desplegado identificado; secretos rotados |
| P0 | Lint verde | 0 errores sin silenciar reglas (autorización pendiente) |
| P1 | Disponibilidad fiable | Horas/bloqueos persistidos, solapes cubiertos, reserva atómica, prueba UTC/Bogotá |
| P1 | Pagos/pedidos fiables | E2E sandbox + manual (aprobar/rechazar, stock, reintentos, firma, parciales) |
| P1 | Operación anandacore | Auth/roles/RLS auditados, métricas reales, módulos `501` ocultos (contenido IA; visible en sidebar), cron y correo probados |
| P2 | Núcleo configurable | Segundo negocio desde el mismo código sin editar fuentes (solo en madurez) |
| P3 | Plantilla extraída | Repo base separado a partir de versión madura |

Rifas eliminadas del código por decisión del propietario (2026-10-16). IA solo con necesidad comercial. PWA y optimizaciones móviles canceladas.
