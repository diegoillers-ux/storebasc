# Piloto de integración delegada

## Estado
Modo sombra: solo decisiones simuladas. No hay adaptador de aprobación/merge, token de escritura ni cambios en protecciones. `mode=active` se rechaza; activar el sistema requiere otro cambio revisado, no cambiar un booleano.

`.github/delegated-merge/policy.json` permite proponer documentación ordinaria de README, docs/help y docs/user-guide: cinco archivos y 200 líneas como máximo. Cambios en gobernanza, CI, agentes, código, datos, pagos, autenticación, renombres o borrados quedan fuera. El alcance delegado de cada tarea debe ser aún más específico.

## Fuentes confiables
El workflow ejecuta el evaluador y política de main protegida; no ejecuta código de PR con credenciales privilegiadas ni consume artefactos de PR como aprobaciones. Los tests de la propuesta son una ejecución separada de solo lectura. El primer PR devuelve HOLD porque todavía no hay evaluador en main.

La tarea se obtiene de QUEUE.json en el SHA de la base, nunca del cuerpo, etiquetas o archivos modificados de la PR. Necesita autorización, dependencias accepted y campos como los del siguiente ejemplo de contrato, que no autoriza una tarea real:

```json
{
  "id": "DOC-EJEMPLO", "authorized": true, "status": "reviewing", "depends_on": [],
  "authorization": {"by": "diegoillers-ux", "at": "2026-10-14T12:00:00-05:00", "reference": "Decisión real del dueño", "scope": "Corrección concreta de README"},
  "merge_delegation": {"enabled": true, "policy_id": "storebasc-docs-shadow-v1", "head_branch": "docs/DOC-EJEMPLO", "allowed_paths": ["README.md"]},
  "acceptance_checks": [{"id": "AC-1", "description": "Enlace correcto comprobado"}]
}
```

## Revisor y control
El revisor independiente solo inspecciona código/evidencia. Un emisor separado publicaría un check `delegated-review` en el HEAD con informe JSON en `output.summary`: repository, pr, verdict, head, base, task_id, full_diff_reviewed, reviewer_session, implementer_session, round, criteria (id/status/evidence) y findings (severity/blocking). La política debe fijar su App ID, diferente del emisor de CI. Actualmente es null: falta configurar esa identidad y toda PR queda sin aprobación automática. El propio implementador o un job de GitHub Actions no puede suplantar ese emisor.

Se exigen los tres checks existentes y sus App IDs asociados al HEAD; GitHub registra allí los checks aunque el job pruebe el commit de integración. El colector vincula cada check a su job/run de pull_request, repositorio, PR, HEAD/base y workflow permitido. Comprueba que el archivo del workflow coincide en base y HEAD y obtiene del log inicial de actions/checkout el commit probado, cuyos padres deben ser base/HEAD exactos; exige success real, no skipped/neutral. Logs o metadatos ausentes bloquean. Se comprueban protecciones, cambios formales solicitados y paginación de conversaciones. El colector vuelve a leer HEAD/base y commit de integración al terminar. Si el token de lectura no accede a protecciones, aparece HOLD; no se reduce el control.

## Uso
`python ops/delegated_merge.py --pr NUMERO` consulta GitHub con gh autenticado y solo lecturas. `--snapshot ARCHIVO` evalúa evidencia capturada sin red; `--output ARCHIVO` guarda únicamente el informe local. Un exit code cero indica informe generado, no autorización de integración.

El workflow se dispara con PR, finalización del CI existente, checks externos o manualmente. No depende de una sesión local abierta. Publica resumen y artefacto; no comenta, aprueba o integra, ni activa tareas siguientes. No se envía un mensaje por cada decisión ordinaria.

## Criterio de activación posterior
Antes de conceder permisos: configurar identidad revisora, acceso de lectura necesario y check obligatorio de origen fijado; evaluar al menos diez decisiones reales etiquetadas independientemente, incluyendo un candidato autorizado de bajo riesgo de extremo a extremo, cero falsos positivos observados y los casos negativos de regresión. Registrar costes y fallos disponibles. Una muestra pequeña no prueba ausencia de errores.

La activación y cambios de esta política requieren decisión del dueño y revisión. Aceptación comercial, despliegues y autorización de tareas nuevas siguen siendo decisiones separadas. El reporte no cambia QUEUE ni marca accepted.
