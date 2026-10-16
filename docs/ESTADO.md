# Estado verificable — Storebasc / anandacore

**Fecha:** 2026-10-16. **Base:** `main = origin/main = 26ca7f3` (merge PR #11;
incluye PR #2, #3, #7, #8, #9, #10; #9–#11 solo docs). `V2` queda como ancestro
histórico (`3fd49aa`).
Árbol versionado limpio; 3 archivos con apariencia de secretos en raíz,
ignorados por `.gitignore` (contenido nunca leído).

## Verificado el 2026-10-16 sobre `26ca7f3`

| Comprobación | Resultado |
|---|---|
| `npm test` | PASS 6/6 |
| `npm run typecheck` | PASS |
| `npm run build` | PASS (no acredita servicios) |
| `npm run test:e2e` (Chromium) | PASS 4/4 (portada, tienda, servicios, login; sin pagos ni reservas) |
| `npm run lint` | FAIL heredado: 53 errores, 66 advertencias (deuda, sin silenciar) |
| Dominio conocido | HTTP 200 con contenido Ananda; **qué commit/entorno, desconocido** |

## Qué existe (código, no operación)

Tienda/servicios públicos con fallbacks de ejemplo; checkout de
servicio/producto/rifa; reservas y disponibilidad (Google Calendar + Supabase);
Mercado Pago + pago manual con comprobante privado; admin (agenda, clientes,
catálogo, pagos, pedidos, configuración); cron de limpieza; enlaces WhatsApp;
correo SMTP. Rifas e IA devuelven `501` (sin backend). Dashboard muestra
placeholders. Modo demo con bypass administrativo: solo aislado.

## No comprobado / desconocido

Supabase remoto (esquema, RLS, roles), Google Calendar real, Mercado Pago
sandbox/prod, Blob privado, SMTP real, cron remoto, env/entorno desplegado en
Vercel, rotación de credenciales expuestas según reporte anterior.

## Deuda prioritaria

1. Accesos de lectura Vercel/Supabase y verificación remota.
2. Lint 53/66 (tarea en espera, sin autorización).
3. Disponibilidad: horas/bloqueos no persistidos, solapes, reserva no atómica.
4. Pagos/pedidos: idempotencia, stock, E2E manual y sandbox.
5. Auth/roles/RLS + bypass demo auditados en entorno aislado.
