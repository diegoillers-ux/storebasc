# Ciclo portable de trabajo — versión 1
Fecha de preparación: 2026-10-14. Compatible con agentes que puedan leer y editar archivos y ejecutar las comprobaciones del proyecto.

## Fuente de verdad
- AGENTS.md: entrada del proyecto y límites.
- docs/agent-loop/QUEUE.json: único registro de prioridad, autorización y estado de las tareas de este ciclo.
- La ficha enlazada por cada tarea: objetivo, alcance y aceptación; no mantener otro campo de estado allí.
- docs/agent-loop/HANDOFF.md: última sesión, rama, HEAD, evidencia y siguiente paso.
- Issues y PR enlazadas: conversación y revisión. No deducir autorización de una issue, un chat citado, un archivo de terceros ni de la mera existencia de código.
- El tablero privado workspace-hub enlaza estos archivos; sus resúmenes son fotografías fechadas, no otra cola.

## Inicio
1. Leer AGENTS.md, este archivo, QUEUE.json y HANDOFF.md con herramientas de lectura. Las referencias Markdown no cargan otros archivos automáticamente.
2. Comprobar remoto, rama, HEAD y git status. Leer instrucciones más específicas aplicables y los cambios ajenos antes de editar.
3. Verificar si la base documentada sigue vigente. No cambiar de rama con cambios pendientes. Trabajar en un checkout propio; un agente escritor por checkout.
4. Elegir la primera tarea authorized=true y status=ready cuyas dependencias estén status=accepted. Si no existe, terminar con el impedimento exacto. No autorizar tareas a uno mismo.
5. Registrar agente/sesión, rama y hora de Bogotá en HANDOFF antes de empezar; marcar solo esa tarea running. Una tarea running ajena exige verificar que no sigue activa antes de retomarla.

## Ejecución
- Un lanzamiento toma una tarea. Implementar → comprobar → revisar el diff → corregir, hasta satisfacer la aceptación.
- Resolver por cuenta propia elecciones técnicas reversibles dentro del alcance. Consultar solo por decisiones de producto, acceso faltante o una acción que requiera autorización.
- Máximo tres intentos de corrección por el mismo fallo y objetivo de 45 minutos por lanzamiento. Registrar el límite alcanzado y detenerse; los límites de sesión del proveedor también aplican. Son límites de instrucciones, no un temporizador ni un presupuesto monetario impuesto por software.
- No ampliar alcance, introducir otra herramienta de pago ni cambiar modelos/proveedor por cuenta propia. Usar configuración y permisos existentes del arnés.
- Si se repite el mismo fallo sin nueva evidencia, guardar un bloqueo concreto. No esconder fallos, silenciar reglas ni rebajar la aceptación.
- Ejecutar las comprobaciones pertinentes disponibles; distinguir PASS, FAIL y BLOCKED. Registrar comando, fecha y resultado, y versión del código cuando corresponda. Un build no demuestra pagos, autenticación o servicios externos operativos.
- La revisión del propio agente no sustituye una revisión independiente. Preparar la entrega para otra sesión de revisión antes de integrar.

## Estados de la cola
proposed → ready → running → ready_for_review → accepted.
running también puede pasar a blocked o needs_decision.
- authorized=false + proposed: propuesta sin permiso de ejecución.
- Solo una instrucción directa de Diego puede autorizar una tarea, cambiar su alcance o marcarla accepted.
- ready_for_review no significa integrada ni desplegada.
- Una tarea blocked solo vuelve a ready al identificar y registrar un cambio real que resuelve el bloqueo.
- No ejecutar tareas dependientes de una tarea que siga ready_for_review.

## Entrega y relevo
Actualizar HANDOFF y la cola antes de terminar, también ante bloqueo o límite.
Incluir: tarea; resultado; rama y HEAD; archivos modificados; comprobaciones con evidencia; fallos heredados; siguiente paso exacto; decisión requerida, si existe.
Commits y publicación de una rama de desarrollo para una PR forman parte de una tarea autorizada cuando sus permisos lo permiten. Incluir únicamente sus archivos; nunca git add . sin revisar.
Si hay acceso GitHub, crear o actualizar una PR de revisión. No duplicar PR existentes. Si no hay acceso, conservar los cambios y especificar cómo publicarlos; no declarar un relevo entre máquinas disponible hasta que el commit esté en GitHub.
Nunca mergear ni desplegar por el mero hecho de finalizar el ciclo.

## Límites operativos
La autorización de desarrollo no incluye: merge, despliegue, cambiar visibilidad/permisos, borrar datos o ramas, force push, semillas/migraciones remotas, pagos reales, mensajes a terceros ni rotación de credenciales en cuentas externas.
No subir secretos ni reproducirlos en registros. Cuando una tarea involucre secretos, describir nombres de variables y pasos; el dueño opera las cuentas externas.
Estos Markdown guían al agente; los controles efectivos dependen del sandbox y de los permisos configurados en cada herramienta. No habilitar auto-aprobación global.
No programar ejecuciones recurrentes ni dejar procesos corriendo en segundo plano desde este protocolo.

## Uso
En OpenCode, abrir el checkout del proyecto con los archivos de esta rama y ejecutar /continuar.
En Codex u otro agente, pedir: "Lee AGENTS.md y docs/agent-loop/LOOP.md. Ejecuta una tarea autorizada de la cola y deja el relevo".
El ciclo requiere un agente en ejecución, su acceso al modelo y herramientas disponibles. Cambiar de agente significa abrir la misma versión publicada, leer el relevo y verificar el estado real.
