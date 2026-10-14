# Storebasc

Plataforma Next.js para tienda, reservas y administración. La implementación actual sigue personalizada para **Espíritu Ananda**; el producto reutilizable Storebasc Core es el objetivo de evolución.

## Punto de partida

Consolidación preparada el **2026-10-13** desde `V2`, descendiente de `main`. El detalle verificable está en [docs/PROJECT-STATE.md](docs/PROJECT-STATE.md).

**La compilación no acredita operación real.** Hay deuda de lint, validaciones externas pendientes y el dominio conocido devuelve `404 DEPLOYMENT_NOT_FOUND`. No presentar este repositorio como producto terminado.

## Preparación

Requisitos: Git, Node 24, npm y acceso a las credenciales de un entorno de pruebas para validar integraciones.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

En PowerShell usa `Copy-Item .env.example .env.local`. Sustituye placeholders en el archivo local; nunca subas sus valores. No ejecutar semillas ni migraciones sobre una base remota sin revisar el destino.

Sin credenciales pueden verificarse compilación y parte del renderizado. Los catálogos actualmente tienen fallbacks con datos de ejemplo: que aparezcan tarjetas no demuestra conexión a Supabase.

## Verificaciones

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

El smoke inicia automáticamente `next start` en `http://127.0.0.1:3000`. Para un despliegue autorizado define `E2E_BASE_URL`; en ese caso no inicia servidor local. Las pruebas solo leen las rutas públicas y verifican renderizado; no prueban compras ni autenticación completa.

`npm run check` ejecuta lint, tipos, regresiones y build, deteniéndose ante el primer fallo. El lint tiene deuda conocida; no está desactivado. CI ejecuta los controles en jobs separados para ver los resultados aunque lint falle.

## Documentación vigente

| Archivo | Uso |
|---|---|
| [AGENTS.md](AGENTS.md) | Entrada común para agentes |
| [docs/PROJECT-STATE.md](docs/PROJECT-STATE.md) | Estado, evidencias y límites |
| [docs/architecture.md](docs/architecture.md) | Estructura técnica actual |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Prioridades y criterios de salida |
| [docs/WORKFLOW.md](docs/WORKFLOW.md) | Ejecución y revisión de tareas |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | Entornos e integraciones |
| [docs/tasks/SB-001-consolidation.md](docs/tasks/SB-001-consolidation.md) | Relevo de esta consolidación |

`CLAUDE.md` importa la entrada común. Para otros arneses, indica explícitamente que lean `AGENTS.md` y la tarea. Cada arnés configura por separado credenciales, herramientas y permisos.

Los documentos de agosto están conservados en `docs/archive/2026-08/`. El paquete `ENTREGA-CLIENTE/` es histórico y sus PDFs no se regeneraron en esta consolidación.
