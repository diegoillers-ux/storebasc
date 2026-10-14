<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Storebasc — protocolo del proyecto

## Inicio de una sesión
1. Lee `docs/PROJECT-STATE.md` y `docs/WORKFLOW.md`.
2. Comprueba rama, HEAD, estado de Git y diferencias con `main`. No sobrescribas cambios ajenos.
3. Lee la tarea en `docs/tasks/` y solo los módulos/documentos que requiera.
4. Consulta `docs/architecture.md` para estructura y `docs/ROADMAP.md` para prioridad.

## Trabajo y límites
- `main` es la base de integración; trabaja en ramas cortas y entrega mediante PR.
- El usuario autorizó consolidar `V2`; conservar `main` y `V2` hasta revisar la PR.
- No fusionar, desplegar, borrar ramas, alterar datos remotos ni activar pagos reales sin instrucción del usuario.
- Mercado Pago y transferencia manual son las opciones vigentes. No reintroducir Wompi.
- No inventar ventas, métricas, stock, estados de prueba ni integraciones operativas.
- No commitear secretos, `.env.local`, archivos temporales o resultados generados.
- `NEXT_PUBLIC_DEMO_MODE=true` permite bypass administrativo: usar únicamente en entornos aislados. Nunca en producción.
- Mantener las reglas de Next.js del bloque administrado superior.
- `docs/archive/` y `ENTREGA-CLIENTE/` son evidencia histórica, no instrucciones vigentes. No actualizar PDFs históricos como si fueran entregas actuales.

## Verificación y relevo
- Instalar con `npm ci`; usar Node 24 (ver `.node-version`).
- Ejecutar `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` y pruebas pertinentes.
- Para smoke en navegador: instalar Chromium y ejecutar `npm run test:e2e` después del build.
- No desactivar reglas para presentar checks verdes. Registrar errores heredados y pruebas bloqueadas.
- Documentar comandos, resultados, commit/árbol verificado, cambios pendientes y siguiente acción en la tarea/PR.
- Instrucciones Markdown no arrancan agentes: la ejecución depende del arnés, permisos, terminal y acceso al repositorio.

## Ciclo entre agentes (Codex, OpenCode y otros)
Lee explícitamente docs/agent-loop/LOOP.md, docs/agent-loop/QUEUE.json y docs/agent-loop/HANDOFF.md para el trabajo por tareas.
La cola controla autorización y estado; docs/WORKFLOW.md sigue siendo la guía general de entrega. La instalación de continuidad autoriza solo BOOT-001; no implica iniciar remediaciones de producto.
Nombre visible indicado por Diego: Sotorebasc; identificador GitHub existente: storebasc. No renombrar código, marca Ananda ni repositorio automáticamente.
