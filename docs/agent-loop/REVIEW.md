# Revisión independiente
Esta revisión busca errores importantes dentro de una tarea autorizada. No rediseña el producto ni sustituye la decisión de Diego.

## Separación de roles
- Un agente escritor implementa y prepara el diff.
- Un revisor distinto recibe contexto nuevo, la ficha de tarea, el diff completo contra la base real de la PR y los resultados de CI.
- El revisor solo lee. No modifica archivos, ejecuta comandos, llama servicios, comenta/aprueba en GitHub, cambia el estado de la PR ni integra.
- Si no se puede proporcionar el diff completo o no se puede usar un contexto revisor separado, el resultado es BLOCKED. El escritor no se autoaprueba.
- La revisión iniciada manualmente por Diego en ChatGPT puede servir como otra revisión, pero no cuenta como ejecución automática del revisor de este flujo.

## Qué comprobar
1. Cada cambio corresponde al objetivo, alcance y criterios de aceptación de la ficha.
2. Busca errores funcionales, regresiones, riesgos de datos/seguridad, manejo de errores y cambios fuera de alcance.
3. Contrasta el código cambiado y su contexto con las instrucciones del proyecto.
4. Comprueba que los resultados presentados de CI pertenecen al HEAD actual de la PR. No atribuyas una prueba que no hayas ejecutado o visto.
5. Revisa el diff entero, no solo los archivos nombrados en el relevo. Comprueba que la base coincide con la base de integración prevista.

## Respuesta obligatoria
Empieza con uno de estos estados:
- APPROVE: no hay hallazgos bloqueantes y se cumplen los criterios revisables.
- CHANGES_REQUESTED: al menos un hallazgo accionable debe corregirse.
- BLOCKED: falta diff, criterio, acceso o evidencia necesaria.

Para cada hallazgo escribe: severidad P0/P1/P2/P3, archivo y línea, evidencia, impacto y cambio esperado. Ordena de más grave a menos grave. P0-P2 bloquean; P3 se registra y bloquea solo si afecta aceptación, seguridad o uso. No inventes fallos ni conviertas preferencias personales en defectos.
Si apruebas, declara qué archivos/commit revisaste, qué CI viste y cualquier límite. APPROVE no autoriza merge, despliegue ni aceptación final.

## Ciclo de devolución
El escritor aplica los hallazgos en la misma tarea y pasa el nuevo diff completo al mismo revisor. Se permiten hasta tres rondas. Un resultado CHANGES_REQUESTED no pasa a ready_for_review. Si la ronda tres sigue con fallos, guarda el hallazgo y pasa a blocked.
