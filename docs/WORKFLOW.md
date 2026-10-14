# Flujo de trabajo portable

1. Leer `AGENTS.md`, estado actual, Git y tarea; comprobar que las notas corresponden al código.
2. Definir un resultado observable, alcance y aceptación en `docs/tasks/SB-NNN-*.md` o en una issue. La tarea enlaza la issue; no duplicar dos listas de estado independientes.
3. Crear una rama desde la base acordada y un checkout/worktree por agente. No compartir un directorio de trabajo entre implementaciones concurrentes.
4. Implementar cambios pequeños y verificar los recorridos afectados. No ejecutar compras, correos a terceros, semillas ni escrituras remotas como parte de un smoke.
5. Ejecutar controles y documentar resultados asociados a la versión. Registrar fallos y bloqueos con evidencia.
6. Abrir PR y solicitar una revisión independiente del diff, aceptación y resultados. Corregir hallazgos y repetir controles afectados.
7. El dueño del producto decide integración y despliegue. Una revisión de IA no equivale a una aprobación formal de otro colaborador en GitHub.

## Relevo entre herramientas

Publicar la rama y guardar cambios antes de cambiar de máquina. No basta con un resumen en el chat.

Instrucción de inicio: "Lee AGENTS.md y la tarea. Verifica rama, HEAD, cambios pendientes y evidencias. Continúa desde el siguiente paso registrado".

Cada tarea registra objetivo, aceptación, rama, cambios, verificaciones, bloqueos y siguiente paso. `docs/archive/` no sirve como memoria vigente.

## Roles

- Coordinador: delimita tarea y dependencias; no declara integraciones operativas sin pruebas.
- Implementador: modifica y comprueba el código.
- Revisor: revisa diff y resultados con criterio independiente.
- Dueño del producto: prioriza y acepta entregas.

Pueden aplicarse en sesiones sucesivas. No se necesita un orquestador multiagente para empezar.

## Controles

CI define `lint`, `types-and-regressions` y `build-and-smoke`. El check `lint` analiza todos los archivos JavaScript/TypeScript modificados por la PR; así los fallos conocidos del resto del repositorio no bloquean cambios no relacionados. `npm run lint` sigue siendo la comprobación completa local y conserva la deuda visible; no se desactivan reglas. En `main` están configurados como obligatorios los tres checks, la resolución de conversaciones, la prohibición de force-push y la prohibición de borrar la rama. La protección no exige aprobaciones formales: la cuenta tiene un único colaborador.
