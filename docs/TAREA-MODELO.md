# Ficha de tarea — modelo (una sola casa: `docs/`)

## Tarea

ID, objetivo observable (qué podrá hacer o comprobar el propietario al terminar).

## Alcance

Archivos/módulos incluidos y excluidos. Base: `main` en HEAD indicado.
Rama corta (`chore|feat|fix/...`). Sin merge, deploy ni escrituras remotas
sin orden explícita.

## Aceptación

- [ ] Criterio verificable + comprobación que lo demuestra.

## Validación

Comandos corridos sobre el HEAD final, cada uno con PASS/FAIL/BLOCKED,
evidencia y límites. Deuda heredada visible, reglas no silenciadas.

## Relevo

Rama, HEAD inicial/final, archivos, revisión (veredicto y rondas), checks,
fallos, decisión pendiente del propietario y siguiente paso.
La ficha es el relevo: no hay cola ni handoff paralelos.

## Revisión (modelo híbrido)

- Zona de riesgo (pagos, auth/roles, datos/migraciones, entornos/secretos,
  integraciones externas): revisor independiente obligatorio
  (`.opencode/agents/reviewer.md`, contexto separado, solo lectura).
- Resto: autovalidación con checklist ciego — releer el diff completo,
  recorrer lo afectado, declarar límites. Prohibido autoaprobarse en riesgo.
- Máximo 3 rondas de corrección. `APPROVE` no autoriza merge ni deploy.
