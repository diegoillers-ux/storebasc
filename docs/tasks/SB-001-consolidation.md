# SB-001 — Consolidar el punto de partida

## Objetivo

Unificar los avances main/V2, retirar artefactos locales y distinguir implementación, pruebas y operación real para continuar desde cualquier arnés.

## Aceptación

- [x] Comparación de ramas con SHAs identificados y contenido V2 revisado.
- [x] Código V2 conservado en rama de propuesta; originales intactos.
- [x] Documentación vigente e histórica separada, sin reglas de escritura directa obligatoria a main.
- [x] Artefactos generados retirados; ignorados para futuras sesiones.
- [x] Instalación, tipos, compilación, regresiones y smoke Chromium ejecutados; deuda y límites declarados.
- [x] README, AGENTS y estado con instrucciones de continuidad.
- [ ] PR revisada e integrada por el dueño del producto.

## Avances y evidencia

Rama: `chore/consolidate-baseline-20261013`. Verificación vigente: `../verification/2026-10-14.md`; la evidencia de la inspección inicial está en `../verification/2026-10-13.md`. PR #2: https://github.com/diegoillers-ux/storebasc/pull/2.

La consolidación no completa el piloto ni configura servicios remotos. CI revisa ESLint en archivos de código modificados; el lint completo mantiene deuda visible. La PR sigue pendiente de revisión independiente actualizada y de decisión del dueño del producto.

## Bloqueos

53 errores y 66 advertencias de ESLint en el repositorio completo; el dominio público devuelve 404; no hay credenciales autorizadas de integración en el entorno. Las cuatro pruebas Chromium locales pasan para las rutas públicas/login de smoke, pero no cubren reservas ni pagos. No hay prueba de servicios reales.

## Relevo

1. Revisar independientemente el diff publicado y confirmar los checks de GitHub sobre el HEAD actual.
2. El dueño del producto decide si integra PR #2; no se debe presentar el repo como desplegado ni validado con servicios reales.
3. Después de integrar y autorizar una tarea, continuar SB-002: disponibilidad/entorno y controles fiables siguiendo el ROADMAP. Mantener tareas pequeñas y validar recorridos críticos antes de nuevas funciones comerciales.

No usar los PASS históricos como prueba de vigencia; repetir en un sandbox autorizado con credenciales propias.
