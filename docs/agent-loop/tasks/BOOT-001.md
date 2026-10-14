# BOOT-001 — comprobar continuidad entre agentes
## Objetivo
Comprobar que este checkout ofrece una entrada común y suficiente para continuar sin el historial del chat.
## Alcance
Leer instrucciones, cola, relevo y estructura; ejecutar solo inspección Git y comprobación de espacios (git diff --check).
Editar únicamente docs/agent-loop/HANDOFF.md y el estado BOOT-001 en QUEUE.json. No modificar código, credenciales ni configuración del producto.
## Aceptación
- Confirmar remoto, rama, HEAD inicial y final, y base directa de integración de la PR.
- Leer las instrucciones y referencias explícitas; citar sus rutas en el relevo.
- Confirmar que /continuar tiene un archivo .opencode/commands/continuar.md.
- Registrar tareas futuras como propuestas, sin autorizarlas.
- Entregar el diff exacto de esta tarea, la ficha y evidencia a un revisor independiente de solo lectura.
- Corregir hallazgos dentro del alcance, hasta tres rondas.
- Terminar en ready_for_review solo si el revisor aprueba y los checks CI configurados del HEAD actual pasan. Si no existe CI, deben pasar todos los comandos de validación de la ficha en ese HEAD y se debe declarar la ausencia de CI; acceso, evidencia o revisión faltante queda BLOCKED/needs_decision.
## Validación
git status --short; git branch --show-current; git rev-parse HEAD; git diff --check.
No compilar ni llamar servicios externos durante esta comprobación de continuidad.
## Entrega
HANDOFF.md y QUEUE.json coherentes con la base real, HEAD final, cambios permitidos, veredicto del revisor y resultados de checks. No afirmar que hubo revisión si no se ejecutó.
