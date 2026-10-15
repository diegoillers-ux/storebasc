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
- Heredadas y vigentes: `main` base; demo solo aislado; no inventar
  operación; no commitear secretos ni temporales.
