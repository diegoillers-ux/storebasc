# Puerta de revisión independiente
## Responsables
El implementador toma una tarea autorizada y mantiene una PR de borrador. Un segundo agente en contexto separado examina la entrega; el mismo escritor nunca se autoaprueba.
## Revisión
Antes de invocar al revisor, el implementador reúne la ficha, el diff completo contra la base real de la PR y checks asociados al HEAD actual. El revisor sigue este archivo, no escribe, no usa shell ni herramientas externas y no cambia la PR. Devuelve APPROVE, CHANGES_REQUESTED o BLOCKED. Para hallazgos P0-P2 cita archivo/línea, evidencia, impacto y cambio esperado.
## Devolución
Con CHANGES_REQUESTED, el escritor corrige dentro del alcance y solicita nueva lectura del diff. Máximo tres rondas. Si persisten hallazgos, falta evidencia o no hay revisor separado, mantener la PR en borrador y dejar running/blocked/needs_decision según corresponda.
## Salida
Solo APPROVE del revisor y CI requerido en verde permiten marcar la tarea ready_for_review y dejar la PR lista para revisión humana. Diego conserva la decisión de accepted y merge.
Las instrucciones orientan al modelo; la aplicación real depende de los permisos del agente y de GitHub.
