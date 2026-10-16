---
description: Cerrar sesión — actualizar el estado y dejar constancia
---

Actualiza `docs/STATE.md` con lo real de esta sesión (delta y `git log` recientes). Reglas:

- **Now**: foco real actual (o "sin rama activa") + base/HEAD.
- **Next**: máximo 3 acciones concretas; la primera es la recomendada.
- **Blockers**: solo lo que depende de mí o de accesos externos.
- **Ficha activa**: la ficha vigente o "(ninguna)".
- **Última verificación**: una línea, solo si hubo corridas.

Límites:

- La evidencia detallada (tabla PASS/FAIL/BLOCKED) vive en la ficha de tarea, nunca en STATE.
- No toques código.
- No hagas push, merge, deploy ni borres ramas.
- Si hay cambios sin commitear, propón el mensaje convencional (`feat|fix|chore|docs(...)`) y espera mi confirmación antes de commitear.

Responde en español: qué actualizaste, qué quedó sin commitear y qué decisión mía queda pendiente.
