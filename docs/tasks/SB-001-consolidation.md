# SB-001 — Consolidar el punto de partida

## Objetivo

Unificar los avances main/V2, retirar artefactos locales y distinguir implementación, pruebas y operación real para continuar desde cualquier arnés.

## Aceptación

- [x] Comparación de ramas con SHAs identificados y contenido V2 revisado.
- [x] Código V2 conservado en rama de propuesta; originales intactos.
- [x] Documentación vigente e histórica separada, sin reglas de escritura directa obligatoria a main.
- [x] Artefactos generados retirados; ignorados para futuras sesiones.
- [x] Instalación, tipos, compilación y regresiones ejecutados; fallos/bloqueos declarados.
- [x] README, AGENTS y estado con instrucciones de continuidad.
- [ ] PR revisada e integrada por el dueño del producto.

## Avances y evidencia

Rama: `chore/consolidate-baseline-20261013`. Bases, pruebas y deuda: `../verification/2026-10-13.md`. El enlace PR y árbol exacto verificado quedan en GitHub.

La consolidación no completa el piloto ni configura servicios remotos. CI se añade para visibilizar resultados; no hay checks verdes de lint por declaración.

## Bloqueos

74 errores de ESLint heredados; Chromium no descargable localmente; dominio público devuelve 404; no hay credenciales autorizadas de integración en el entorno.

## Relevo

1. Abrir la PR y comparar su diff con main; comprobar CI, incluidas las regresiones y navegador.
2. Corregir o tratar explícitamente la deuda bloqueante antes de integrar según la política adoptada. No silenciar ESLint.
3. Continuar SB-002: disponibilidad/entorno y controles fiables siguiendo prioridades del ROADMAP. Crear una tarea pequeña por resultado; no añadir nuevas funciones comerciales hasta validar los recorridos críticos.

No usar los PASS históricos como prueba de vigencia; repetir en un sandbox autorizado con credenciales propias.
