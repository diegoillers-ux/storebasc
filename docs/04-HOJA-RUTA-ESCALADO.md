# Hoja de Ruta de Escalado - Codebasicstor

## Objetivo
Escalar el proyecto sin rehacer la base actual, manteniendo continuidad operativa y control de costos.

## Nivel 1 - Minimo (Listo para crecer con bajo costo)
Plazo estimado: 1 a 2 semanas.

### Alcance tecnico
1. Endurecer seguridad basica.
2. Mejorar trazabilidad de errores.
3. Preparar operacion estable para mas clientes simultaneos.

### Tareas
1. Rotar y normalizar secretos (`NEXTAUTH_SECRET`, `CRON_SECRET`, claves Google y Gmail).
2. Estandarizar variables por entorno (`development`, `preview`, `production`).
3. Agregar logging estructurado para rutas API clave.
4. Mejorar manejo de errores con mensajes internos/externos separados.
5. Documentar runbook de incidencias (login, calendar, correo, cron).

### Resultado comercial
- Menos riesgos operativos.
- Soporte mas rapido.
- Base confiable para primeras ventas recurrentes.

## Nivel 2 - Recomendado (Escala operativa real)
Plazo estimado: 2 a 4 semanas.

### Alcance tecnico
1. Separar configuracion del negocio del codigo.
2. Mejorar consistencia de reservas y estados.
3. Introducir metrica minima de negocio.

### Tareas
1. Migrar servicios/productos/config a base de datos (PostgreSQL o equivalente).
2. Agregar tabla de reservas con estados (`pending`, `approved`, `expired`, `cancelled`).
3. Implementar idempotencia en aprobacion y actualizacion de evento.
4. Consolidar disponibilidad en una capa de dominio (horarios + bloqueos + calendar busy).
5. Panel admin con filtros, busqueda y auditoria basica (quien aprobo, cuando, cambios).
6. Instrumentar metricas: reservas por dia, conversion, tiempo promedio de aprobacion.

### Resultado comercial
- Menos trabajo manual.
- Mejor control de operacion diaria.
- Capacidad de atender mas volumen sin perder calidad.

## Nivel 3 - Premium (Escala de producto)
Plazo estimado: 4 a 8+ semanas.

### Alcance tecnico
1. Plataforma multi-tenant (varios negocios sobre la misma base).
2. Automatizaciones avanzadas y experiencia premium.
3. Preparacion para equipo y crecimiento comercial sostenido.

### Tareas
1. Multi-tenant por cuenta/organizacion con aislamiento de datos.
2. Roles y permisos (`owner`, `admin`, `operador`, `lectura`).
3. Integracion de pasarela de pagos opcional (toggle por tenant).
4. Sistema de plantillas de correo y branding por cliente.
5. Cola de tareas para correos/cron/eventos (retry y backoff).
6. Observabilidad completa (alertas, dashboard, SLI/SLO basicos).
7. Suite de pruebas E2E para flujo completo de reserva.

### Resultado comercial
- Producto vendible a multiples clientes.
- Menor dependencia operativa del equipo fundador.
- Mejor posicion para contratos B2B y partners.

## Prioridad sugerida por impacto
1. Seguridad y secretos.
2. Persistencia en DB para reservas y configuraciones.
3. Auditoria y observabilidad.
4. Multi-tenant y roles.
5. Automatizacion y optimizacion de conversion.

## KPI sugeridos para decidir avance de nivel
1. Reservas/semana.
2. % de reservas aprobadas en menos de 2 horas.
3. Errores API por 1000 requests.
4. Tiempo medio de resolucion de incidentes.
5. Tasa de conversion visita -> reserva.

## Criterio de paso entre niveles
- Pasar de Nivel 1 a Nivel 2 cuando haya operacion estable y demanda recurrente.
- Pasar de Nivel 2 a Nivel 3 cuando el modelo requiera vender a multiples negocios y delegar operacion.

