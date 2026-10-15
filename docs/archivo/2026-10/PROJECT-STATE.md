# Estado actual — punto de partida Storebasc

**Fecha:** 2026-10-15. **Estado:** PR #2 y PR #3 integradas en `main` (`aca6158`); operación productiva no acreditada. Higiene en curso en `chore/higiene-identidad-20261015` (sin integrar).

## Base elegida

`main` (y `origin/main`) apuntan a `aca6158177875f28807e069cd13ec26292b4e7d1` (merge de PR #2 del 2026-10-14; incluye el contenido de PR #3). `V2` sigue en `3fd49aa1f61202058d22ec057f225ac629f0b108` como ancestro histórico de `main`.

No se borró historia ni se aplicó force push. El punto de partida es el commit de integración `aca6158`, no el nombre V2 ni los SHAs de ramas ya integradas.

## Identidad (decisión del propietario, 2026-10-15)

Storebasc es el núcleo/plantilla SaaS reutilizable; anandacore es el nombre del proyecto final para el cliente y estandariza las variantes lina/ananda/nexocelestial. La separación en dos proyectos (base + personalizaciones) se hará cuando el proyecto alcance una versión madura que sirva como base sólida; hasta entonces se trabaja en este repositorio sin crear un segundo repo ni ramas de larga vida. La referencia externa workspace-hub no se usa.

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
- Añadidos CI y plantilla de PR. Protección de `main` verificada por lectura en GitHub el 2026-10-14: requiere los checks `lint`, `types-and-regressions` y `build-and-smoke`, exige resolución de conversaciones, prohíbe force-push y borrado y se aplica a administradores. Como la cuenta tiene un único colaborador, no exige aprobación formal. La revisión independiente del agente sigue siendo manual; ver [verification/2026-10-14.md](verification/2026-10-14.md).
- README e instrucciones raíz actualizados; `.agents/AGENTS.md` apunta a la entrada común y CLAUDE.md la importa.
- Documentación de agosto conservada en `docs/archive/2026-08/` como evidencia histórica. `ENTREGA-CLIENTE/` y sus PDFs conservan su contenido original.

## Lo comprobado

Instalación (histórica 2026-10-14), tipos, compilación, seis pruebas, cuatro rutas Chromium de smoke y ESLint de los archivos modificados pasan (reverificado 2026-10-15 sobre `aca6158`). `npm run lint` completo conserva 53 errores y 66 advertencias. CI analiza los archivos de código cambiados por cada PR, manteniendo la deuda restante visible y sin silenciar reglas. Detalle vigente: [verification/2026-10-14.md](verification/2026-10-14.md); inventario inicial: [verification/2026-10-13.md](verification/2026-10-13.md).

El dominio conocido respondía **404 DEPLOYMENT_NOT_FOUND** el 2026-10-14; el 2026-10-15 responde **HTTP 200** con título Ananda (64 KB HTML, sin `DEPLOYMENT_NOT_FOUND`). Qué commit y entorno se desplegó sigue desconocido. No se inspeccionaron equipos/proyectos en Vercel ni el estado remoto de Supabase; no inferir disponibilidad de servicios desde el 200.

## Bloqueos y deuda prioritaria

1. Recuperar despliegue de pruebas y ejecutar smoke contra ese dominio. La issue #1 continúa válida para despliegue; los falsos positivos fueron abordados en código y el smoke local de producción pasa con Chromium en GitHub Actions.
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
