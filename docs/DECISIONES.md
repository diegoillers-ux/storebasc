# Decisiones del propietario

El chat manda; este archivo deja constancia fechada. Lo que lo contradiga en el
archivo histórico queda sin vigencia.

## 2026-10-15

- **Identidad**: Storebasc = núcleo/plantilla SaaS; anandacore = proyecto final
  del cliente (estandariza lina/ananda/nexocelestial). Estandarización solo en
  docs por ahora; código, marca en UI y repo no se renombran automáticamente.
- **Dos proyectos**: un solo repo hasta la versión madura que sirva de base
  sólida; entonces se extrae la plantilla. Sin segundo repo ni ramas largas.
- **workspace-hub**: referencia externa no usada; cada proyecto lleva su flujo.
- **Pagos**: Mercado Pago + transferencia manual. Wompi no vuelve.
- **Secretos**: los 3 archivos en raíz + `.env` se mantienen locales e
  ignorados; contenido no leído. Rotación Google/Supabase pendiente.
- **SB-002 (lint)**: en espera, sin autorización.
- **Accesos**: el propietario comparte accesos Vercel/Supabase (ideal: lectura).
- **PR #7** (higiene SB-003, revisión APPROVE) integrada en `a701f27`.
- **PR #8** (limpieza documental + flujo híbrido) integrada en `ca62fbf`.
  Higiene cerrada: `docs/` mínimos vigentes + archivo + `TAREA-MODELO.md`.
- **Limpieza documental**: archivar todo `.md` vigente a `docs/archivo/2026-10/`;
  `ENTREGA-CLIENTE/` sellado hasta avanzar el desarrollo.
- **Flujo**: modelo híbrido — autovalidación obligatoria por defecto; revisor
  independiente solo en zonas de riesgo. Aplicación directa a `main` para esta
  limpieza; en adelante ramas cortas + PR borrador, sin merge sin orden.
- **Norma A (2026-10-15)**: protección de `main` intacta; por tarea autorizada,
  la IA mergea en verde (3 checks PASS) sin esperar clics. El propietario solo
  entra ante rojo, decisión o hallazgo relevante. Sin auto-merge nativo.
- **Sesión 2026-10-15**: ramas `chore/*` mergeadas y borradas (local+remoto);
  `V2` se conserva como respaldo. MCP mercadopago/mercadolibre configurado y
  claves locales disponibles: el agente las usa sin preguntar.
- **Sesión 2026-10-16**: `ESTADO.md` revalidado sobre `26ca7f3` (PR #12);
  `ARQUITECTURA.md` corregido (PR #13); auditoría de seguridad solo-lectura con
  reviewer 1 ronda (PR #14, hallazgo alta: bypass demo sin fail-closed en prod).
  PR #9–#14 integrados; ramas cortas borradas (local+remoto); solo quedan `main`
  y `V2`. Próximo paso: validar core de negocio y alcance antes de abrir `feat/*`.
- **Sesión 2026-10-16 (cont.)**: autorizado el fix #1 de la auditoría (demo
  fail-closed en prod) en rama `feat/demo-fail-closed-prod`; reviewer
  independiente APPROVE (1 ronda); 3 checks CI verdes; **PR #16 mergeado**
  (`d2714b0`). Rama borrada (local+remoto); quedan solo `main` y `V2`.
  `ESTADO.md` actualizado a `d2714b0` (PR de esta constancia). Pendientes de
  autorización: hallazgos #2/#3/#5/#6/#7 y RUTA P1.
- **Sesión 2026-10-16 (dirección)**: rifas eliminadas totalmente del código
  (borrado, sin rama parada; el historial git las conserva). Alcance: foco en
  core servicios/productos; orden: disponibilidad → pagos/pedidos → auth/roles;
  SEO cuando haya base operativa beta.
- **Sesión 2026-10-16 (core)**: PR #18 (rifas fuera) al #23 (e2e sandbox)
  mergeados. Dirección: foco servicios/productos; orden disponibilidad →
  pagos → auth/roles; SEO en base beta. Sandbox MP verificado de veras
  (TEST + secreto webhook local + comprador de prueba por API + pago APRO
  automatizado con tarjeta oficial). Acceso Supabase por CLI con token local.
  Pendientes: auth/roles/RLS, parciales, lint 43/55, Vercel, Google real.
- Heredadas y vigentes: `main` base; demo solo aislado; no inventar
  operación; no commitear secretos ni temporales.
