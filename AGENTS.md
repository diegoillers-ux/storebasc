<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Storebasc / anandacore — instrucciones para agentes

## Identidad

- **Storebasc**: núcleo/plantilla SaaS reutilizable (este repositorio).
- **anandacore**: proyecto final para el cliente; estandariza lina/ananda/nexocelestial. Estandarización solo en docs por ahora.
- Repo GitHub: `storebasc`. Un solo repo hasta la versión madura; sin segundo repo ni ramas de larga vida.

## Fuente de verdad

1. Las instrucciones del propietario en el chat prevalecen sobre cualquier `.md`.
2. Después: `docs/ESTADO.md` y `docs/DECISIONES.md`.
3. El archivo (`docs/archivo/`, `docs/archive/`) es historial, no guía.

## Entrada

1. Lee `docs/ESTADO.md` y `docs/DECISIONES.md`.
2. Comprueba rama, HEAD, `git status` y diferencia con `main`. No toques cambios ajenos.
3. Lee la ficha de la tarea (`docs/TAREA-MODELO.md`) y solo los docs que pida.
4. Consulta `docs/ARQUITECTURA.md` y `docs/RUTA.md` según el caso.

## Límites

- `main` es la base; trabaja en ramas cortas y entrega en PR borrador. No integres, despliegues, borres ramas ni alteres remotos sin orden explícita.
- Mercado Pago + transferencia manual vigentes. No reintroducir Wompi.
- No inventar ventas, métricas, stock ni integraciones operativas.
- No commitear secretos, `.env*` (salvo `.env.example`), ni temporales. Contenido de secretos nunca se lee ni se muestra.
- Claves locales (`.env` + credenciales ignoradas) y MCP
  (`.agents/mcp_config.json`: mercadopago/mercadolibre) ya disponibles:
  úsalos sin preguntar; nunca los muestres ni commitees.
- `NEXT_PUBLIC_DEMO_MODE=true` solo en entornos aislados. Nunca en producción.
- Solo el propietario autoriza tareas y decide integraciones. Una revisión de IA no es aprobación formal.

## Verificación y relevo

- Node 24 (`npm ci`), luego `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; smoke con `npm run test:e2e` si aplica.
- Zonas de riesgo (pagos, auth/roles, datos/migraciones, entornos/secretos, integraciones externas): revisión independiente obligatoria con `.opencode/agents/reviewer.md`. Resto: autovalidación con checklist ciego.
- No silenciar reglas para poner checks verdes. Declara PASS/FAIL/BLOCKED por comprobación, con evidencia y HEAD.
- Documenta en la ficha: rama, HEAD, cambios, resultados, bloqueos y siguiente paso. Las instrucciones Markdown no arrancan agentes por sí solas.
