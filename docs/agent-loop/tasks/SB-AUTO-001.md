# SB-AUTO-001 — piloto de integración delegada en modo sombra

## Objetivo
Comprobar decisiones de integración delegada mediante un control reproducible antes de conceder permisos de aprobación o merge.

## Alcance
Política documental, evaluador Python, tests, workflow de lectura, documentación y registro de esta tarea. Sin código de producto, secretos, servicios, despliegues ni cambios en protecciones de ramas. Las tareas BOOT-001 y SB-002 conservan su estado y autorización.

## Aceptación
- Emitir MANUAL, HOLD o WOULD_MERGE con razones, HEAD/base y política; merge_enabled siempre false.
- Solo considerar documentación ordinaria en rutas explícitas, máximo cinco archivos y 200 líneas; gobernanza, renombres, borrados y producto requieren decisión humana.
- Exigir tarea delegada en la cola de la base confiable, autorización trazable, dependencias aceptadas, alcance por tarea y criterios verificados.
- Exigir checks de la integración HEAD/base, fuente de cada check, protecciones y conversaciones resueltas; evidencia incompleta bloquea.
- Exigir revisor independiente con aplicación emisora configurada, diff completo, criterios PASS y sin P0-P2 o P3 bloqueantes. App ausente no se sustituye por comentarios o ausencia de hallazgos.
- Workflow con permisos de lectura y ejecución del evaluador desde main protegida; bootstrap informa HOLD.
- Pruebas y replay histórico distinguen evidencia sintética de revisiones/modelos reales; revisión independiente del diff completo.

## Validación
`python -B -m unittest discover -s ops/tests -v`; `git diff --check`; lecturas de PR históricas mediante `python ops/delegated_merge.py --pr NUMERO`; CI existente de tipos, regresiones, lint y smoke.

## Entrega
PR revisable contra main y evidencia de CI/revisión en su descripción. Sin aprobar, aceptar otras tareas, integrar, activar auto-merge ni desplegar. El piloto no instala un proveedor de revisión ni concede credenciales.
