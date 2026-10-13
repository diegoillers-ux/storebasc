# Estado actual — punto de partida Storebasc

**Fecha:** 2026-10-13. **Estado:** consolidación preparada para revisión; operación productiva no acreditada.

## Base elegida

`main` apunta a `3172d4a58afcdbfb7fcad0119103e277e81f3fa7`; `V2` a `3fd49aa1f61202058d22ec057f225ac629f0b108`. V2 es descendiente directo con un commit adicional. Se conserva su contenido funcional en la PR `chore/consolidate-baseline-20261013` contra main.

Las ramas originales se conservan; main no cambia hasta integrar la PR. No se borró historia ni se aplicó force push. Después de integrar, usar el commit de integración como punto de partida, no el nombre V2.

## Qué aporta V2

| Área | Código incorporado | Estado verificable |
|---|---|---|
| Clientes | Ficha ampliada y API de edición por ID | Presente; pendiente prueba con datos y roles reales |
| Pago manual | Comprobantes privados, pagos SUBMITTED y ajustes de aprobación/rechazo | Presente; E2E remoto pendiente |
| Disponibilidad | Google Calendar + reservas activas; retirada de `/api/availability` prefijada | Parcial; no afirmar disponibilidad totalmente resuelta |
| Cron | Cancelación de reservas vencidas en Supabase | Presente; pendiente ejecución controlada e idempotencia |
| WhatsApp | Helpers para confirmación y recordatorios | Links generados; no envío automático |
| Playwright | Configuración y smoke | Recuperado y endurecido; ejecución Chromium local bloqueada |

## Consolidación realizada

- Conservado código funcional V2; eliminados cambios exclusivamente de finales de línea respecto a main para facilitar revisión.
- Retirados del árbol versionado `supabase/.temp/`, `test-results/` y `tsconfig.tsbuildinfo`. La evidencia histórica de errores queda resumida en la verificación y sigue accesible en V2.
- Actualizado `.gitignore` y permitida explícitamente `.env.example`.
- Corregido `next lint` a ESLint CLI; añadidos typecheck, regresiones y check; previews ya no omiten errores de tipos.
- Smoke local por defecto, status HTTP y contenido propio por ruta; una página Vercel con main ya no basta para aprobar.
- Añadidos CI y plantilla de PR. La protección de ramas y sus checks obligatorios no se configuraron remotamente.
- README e instrucciones raíz actualizados; `.agents/AGENTS.md` apunta a la entrada común y CLAUDE.md la importa.
- Documentación de agosto conservada en `docs/archive/2026-08/` como evidencia histórica. `ENTREGA-CLIENTE/` y sus PDFs conservan su contenido original.

## Lo comprobado

Instalación, tipos, compilación, tres regresiones y cuatro rutas por HTTP local. **ESLint falla** con 74 errores y 73 advertencias. **Navegador pendiente** por descarga fallida. Ver comandos, resultados e inventario en [verification/2026-10-13.md](verification/2026-10-13.md).

El dominio conocido responde **404 DEPLOYMENT_NOT_FOUND**. No se inspeccionaron equipos/proyectos en Vercel ni el estado remoto de Supabase; no inferir su disponibilidad desde documentación o correos anteriores.

## Bloqueos y deuda prioritaria

1. Recuperar despliegue de pruebas y ejecutar smoke en navegador. La issue #1 continúa válida para despliegue; sus falsos positivos fueron abordados en código, con navegador pendiente.
2. Resolver lint sin silenciar reglas; controles CI deben mostrar estos fallos.
3. Disponibilidad: horas y bloqueos no persistidos, consulta que omite solapes iniciados antes, reserva no atómica, dependencia de huso del proceso y errores del proveedor.
4. Catálogos con fallback de ejemplos incluso fuera de demo; evitar presentarlos como datos reales y revisar prerenderizado/caché de catálogo.
5. Pagos/manual/inventario: recuperación de fallos parciales, idempotencia, acceso privado a comprobantes y E2E de aprobación/rechazo.
6. Auditar autenticación por rol, RLS y bypass del modo demo en entorno aislado.
7. Verificar rotación/revocación de credenciales Google reportadas anteriormente; credenciales remotas no verificadas en esta sesión.
8. Dashboard/reportes reales y ocultación de módulos sin backend; desacoplar Ananda después de cerrar operación básica.

## Documentación y continuidad

- `AGENTS.md`: entrada y reglas.
- `WORKFLOW.md`: ejecución, revisión y relevo.
- `architecture.md`: código y límites actuales.
- `ROADMAP.md`: próximos resultados y criterios de salida.
- `ENVIRONMENT.md` + `.env.example`: configuración sin secretos.
- `tasks/SB-001-consolidation.md`: tarea y relevo.

Las validaciones sandbox de agosto se conservan como reportes históricos, no como resultados repetidos hoy. Este documento y las evidencias actuales prevalecen ante contradicciones históricas.
