# Storebasc (núcleo) · anandacore (cliente)

Plataforma Next.js para tienda, reservas y administración. Núcleo reutilizable
**Storebasc**; personalización vigente para el cliente final **anandacore**.

**La compilación no acredita operación real.** Hay deuda de lint y validaciones
externas pendientes. No presentar como producto terminado.

## Preparación

Requisitos: Git, Node 24, npm y credenciales de un entorno de pruebas para validar integraciones.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Sin credenciales se verifican compilación y parte del renderizado. Los catálogos
tienen fallbacks con datos de ejemplo: ver tarjetas no demuestra conexión a Supabase.

## Verificaciones

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Documentación

| Archivo | Uso |
|---|---|
| `AGENTS.md` | Entrada para agentes |
| `docs/STATE.md` | Estado vivo (una pantalla) |
| `docs/DECISIONES.md` | Decisiones del propietario |
| `docs/ARQUITECTURA.md` | Estructura técnica y límites |
| `docs/ENTORNOS.md` | Integraciones y secretos |
| `docs/RUTA.md` | Prioridades |
| `docs/TAREA-MODELO.md` | Plantilla de ficha de tarea |
| `docs/archivo/2026-10/INDICE.md` | Qué se archivó y dónde |
