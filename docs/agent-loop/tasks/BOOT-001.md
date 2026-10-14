# BOOT-001 — instalar y comprobar continuidad entre agentes
## Objetivo
Instalar el ciclo portable de trabajo y comprobar que un agente puede entrar, elegir una tarea autorizada y entregar su propuesta para revisión independiente sin depender del historial del chat.
## Alcance
Leer instrucciones, cola, relevo y estructura; definir el comando `/continuar`, el agente revisor de solo lectura y sus reglas compartidas para Codex/OpenCode.
Editar únicamente `.opencode/agents/reviewer.md`, `.opencode/commands/continuar.md`, `AGENTS.md` y los documentos/fichas dentro de `docs/agent-loop/`. No modificar código de producto, credenciales ni configuración de servicios.
## Aceptación
- Confirmar remoto, rama, HEAD inicial y final, y base directa de integración de la PR.
- Leer las instrucciones y referencias explícitas; citar sus rutas en el relevo.
- Crear y comprobar `.opencode/commands/continuar.md` como parte de esta tarea; no tratar su existencia previa como precondición.
- Configurar `.opencode/agents/reviewer.md` para lectura e inspección sin escritura, terminal, herramientas externas ni autoaprobación.
- Documentar qué controles OpenCode impone técnicamente y qué reglas dependen del arnés de otros agentes.
- Registrar tareas futuras como propuestas, sin autorizarlas.
- Entregar el diff exacto de esta tarea, la ficha y evidencia a un revisor independiente de solo lectura.
- Corregir hallazgos dentro del alcance, hasta tres rondas.
- Terminar en ready_for_review solo si el revisor aprueba y todos los checks CI configurados del HEAD actual pasan. El check lint debe revisar archivos de código cambiados y no bloquear esta tarea documental por deuda previa no relacionada; la deuda completa se mantiene registrada. Si no existe CI, deben pasar todos los comandos de validación de la ficha en ese HEAD y se debe declarar la ausencia de CI; acceso, evidencia o revisión faltante queda BLOCKED/needs_decision.
## Validación
git status --short; git branch --show-current; git rev-parse HEAD; git diff --check; comprobar el comando y los permisos del agente revisor.
No compilar ni llamar servicios externos durante esta comprobación de continuidad.
## Entrega
HANDOFF.md y QUEUE.json coherentes con la base real, HEAD final, archivos dentro del alcance, veredicto del revisor y resultados de checks. No afirmar que hubo revisión si no se ejecutó.
