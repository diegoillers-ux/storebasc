# Ciclo portable de trabajo — versión 2
Actualizado: 2026-10-14 · Zona horaria operativa: America/Bogota.

## Para qué sirve
Mantener continuidad entre Codex, OpenCode y otros agentes con una cola por proyecto, un relevo compartido y revisión independiente antes de entregarte una PR lista.

## Fuente de verdad
- AGENTS.md: reglas y límites del proyecto.
- docs/agent-loop/QUEUE.json: prioridad, permiso y estado de cada tarea.
- Ficha enlazada: objetivo, alcance y aceptación.
- docs/agent-loop/HANDOFF.md: última sesión, rama, HEAD, cambios y decisión pendiente.
- docs/agent-loop/REVIEW.md: método y formato de la revisión independiente.
- Issues/PR: conversación y diff. No conceden autorización por sí mismas.
- workspace-hub: prioridades generales; no reemplaza las colas de cada proyecto.

## Antes de empezar
1. Lee AGENTS.md, este protocolo, REVIEW.md, QUEUE.json, HANDOFF.md y la ficha de la tarea. Lee las instrucciones específicas del módulo.
2. Comprueba remoto, rama, HEAD, estado de Git y cambios ajenos. Confirma la base directa real de la PR; no supongas que main es esa base.
3. Si hay una tarea en reviewing sin veredicto, reanuda solo esa revisión; comprueba que no exista otra sesión activa y pasa el diff completo al revisor. Si el revisor pide cambios, vuelve a running para corregir.
4. Si no hay revisión pendiente, elige una tarea authorized=true, status=ready y con dependencias accepted. Registra agente, sesión, hora local y HEAD inicial; marca running.
5. Si no hay tarea elegible, detente y explica el bloqueo. No cambies permisos, alcance ni modelos por cuenta propia.

## Implementar y revisar
1. El agente implementador trabaja dentro del alcance, ejecuta las comprobaciones de la ficha y revisa su diff.
2. Mantiene una PR de borrador para la tarea autorizada. Comprueba que la base y el diff no incluyan trabajo ajeno. No crea PR duplicadas.
3. Antes de cerrar, prepara el diff exacto respecto de la base de esa PR, criterios de aceptación y resultados de CI o, si no existe, de los comandos de validación de la ficha. Pásalos a un agente revisor en un contexto separado. El implementador no puede aprobar su propio trabajo.
4. El revisor sigue docs/agent-loop/REVIEW.md y no tiene permisos para escribir, usar shell, llamar herramientas externas, cambiar PR o lanzar otros agentes.
5. Si devuelve CHANGES_REQUESTED, el implementador corrige dentro del alcance y solicita otra revisión. Máximo tres rondas de corrección/revisión. Si no se resuelve, marca blocked y guarda el motivo.
6. Si no existe revisor separado, la tarea se pausa en needs_decision. Una autolectura, una sesión ChatGPT iniciada manualmente o un check de CI no se presentan como revisión automática independiente.
7. Distingue PASS, FAIL y BLOCKED en cada comando y check. Nunca escondas fallos, bajes la aceptación ni afirmes que una integración externa funciona porque compiló.

## Estados de QUEUE.json
proposed → ready → running → reviewing → ready_for_review → accepted.
- reviewing → running si el revisor pide correcciones.
- running puede pasar a blocked o needs_decision.
- authorized=false + proposed significa que no se puede ejecutar.
- Solo Diego autoriza tareas, cambia su alcance o marca accepted.
- ready_for_review significa revisión independiente aprobada y todos los checks de CI configurados pasan; si no hay CI en ese repositorio, deben pasar los comandos de validación de la ficha ejecutados sobre el HEAD revisado y se debe declarar que no existe CI. La PR queda lista para la decisión de Diego; no significa aceptada ni integrada.
- No iniciar una tarea dependiente hasta que la anterior esté accepted.

## Entrega
Al terminar o bloquearse, actualiza HANDOFF.md y QUEUE.json con tarea, resultado, rama, base de integración, HEAD final, archivos, revisión, checks, fallos, siguiente paso y decisión requerida.
Con revisión aprobada y todos los checks de CI configurados pasan; si no hay CI, pasan los comandos de validación de la ficha sobre el HEAD revisado y se declara su ausencia, la PR puede pasar de borrador a lista para revisión humana. No integrar ni desplegar.
Commits y publicación de la rama/PR pertenecen a la tarea autorizada cuando las herramientas lo permiten. Añade archivos específicos, nunca incluyas cambios ajenos.
Si falta acceso a GitHub, no declares la PR ni el relevo entre estaciones publicados.

## Límites
La autorización de desarrollo no incluye merge, despliegue, permisos/visibilidad, borrar datos o ramas, force push, migraciones o semillas remotas, pagos reales, mensajes a terceros ni rotación de credenciales.
Las instrucciones Markdown orientan al agente; los permisos reales dependen de cada herramienta. No actives aprobación automática global ni ejecuciones recurrentes.
