# Estado verificable — Storebasc / anandacore

**Fecha:** 2026-10-16. **Base:** `main = origin/main = d2714b0` (merge PR #16;
incluye PR #2, #3, #7–#15; #9–#15 solo docs; **#16 fix #1 demo fail-closed**).
`V2` queda como ancestro histórico (`3fd49aa`).
Árbol versionado limpio; 3 archivos con apariencia de secretos en raíz,
ignorados por `.gitignore` (contenido nunca leído).

## Verificado el 2026-10-16 sobre `d2714b0`

| Comprobación | Resultado |
|---|---|
| `npm test` | PASS 8/8 (incluye 2 de `demoMode` fail-closed, PR #16) |
| `npm run typecheck` | PASS |
| `npm run build` | PASS (no acredita servicios) |
| `npm run test:e2e` (Chromium) | PASS 4/4 (portada, tienda, servicios, login; sin pagos ni reservas) |
| `npm run lint` | FAIL heredado: 53 errores, 66 advertencias (deuda, sin silenciar) |
| Dominio conocido | HTTP 200 con contenido Ananda; **qué commit/entorno, desconocido** |

## Qué existe (código, no operación)

Tienda/servicios públicos (intentan Supabase, fallback a ejemplos); checkout de
servicio/producto; reservas y disponibilidad (Google Calendar + Supabase);
Mercado Pago + pago manual con comprobante privado (`proof.ts`: 2 MB, JPG/PNG/PDF);
admin (agenda, clientes, catálogo, pagos, pedidos, configuración) más
**parciales**: `/admin/contenido` (UI existe, GET vacío, POST `501`)
y `/admin/reportes` + panel `/admin` (UI estática `—`/`Sin datos suficientes`);
cron de limpieza (2 jobs); enlaces WhatsApp; correo SMTP. IA contenido: UI
existe, pero POST sin backend (`501`; GET `[]`).
Dashboard y reportes muestran placeholders (`—`). Modo demo con bypass administrativo, **fail-closed en producción**
(`isDemoMode()` falso con `NODE_ENV=production`, PR #16): solo aislado.

## No comprobado / desconocido

Supabase remoto (esquema, RLS, roles), Google Calendar real, Mercado Pago
sandbox/prod, Blob privado, SMTP real, cron remoto, env/entorno desplegado en
Vercel, rotación de credenciales expuestas según reporte anterior.

## Deuda prioritaria

1. Accesos de lectura Vercel y verificación remota (Supabase: CLI autenticado
   con token local; 3 migraciones de disponibilidad aplicadas el 2026-10-16).
2. Lint 53/66 (tarea en espera, sin autorización).
3. Disponibilidad (restos): UI de bloqueos, e2e de calendario. Listo en BD:
   guardia antisolape `bookings_no_overlap_active` + trigger `ends_at`
   (probada con 23P01), columna `weekly`, tabla `blocked_slots`.
4. Pagos/pedidos: idempotencia, stock, E2E manual y sandbox.
5. Auth/roles/RLS: bypass demo ya cerrado en prod (#16); quedan roles de mínimo
   privilegio (#2) y confirmar RLS (#5).
