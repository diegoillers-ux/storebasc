# BOOT-001 — comprobar continuidad entre agentes
## Objetivo
Comprobar que este checkout ofrece una entrada común y suficiente para continuar sin el historial del chat.
## Alcance
Leer instrucciones, cola, relevo y estructura; ejecutar solo inspección Git y comprobación de espacios (git diff --check).
Editar únicamente docs/agent-loop/HANDOFF.md y el estado BOOT-001 en QUEUE.json. No modificar código, credenciales ni configuraciones de producto.
## Aceptación
- Confirmar remoto, rama y HEAD, distinguiendo base de integración y rama de trabajo.
- Leer AGENTS.md y las referencias explícitas; citar sus rutas en el relevo.
- Confirmar que /continuar tiene un archivo .opencode/commands/continuar.md.
- Registrar las tareas futuras propuestas sin autorizarlas.
- Terminar en ready_for_review con evidencia concreta; acceso o archivo faltante queda BLOCKED.
## Validación
git status --short; git branch --show-current; git rev-parse HEAD; git diff --check.
No compilar ni llamar servicios externos durante esta comprobación de continuidad.
## Entrega
HANDOFF.md actualizado y cola coherente. No exigir otro agente o servicio para esta comprobación.
