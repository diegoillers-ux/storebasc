# Estado verificable — Storebasc / anandacore

**Fecha:** 2026-10-16. **Base:** `main = origin/main = 413f9fa` (merge PR #23;
incluye #18 rifas fuera, #19 docs, #20 disponibilidad, #21 guardia `ends_at`,
#22 pagos, #23 e2e sandbox).
`V2` queda como ancestro histórico (`3fd49aa`).
Árbol versionado limpio; secretos solo locales e ignorados (contenido jamás
mostrado ni versionado).

## Verificado el 2026-10-16 sobre `413f9fa`

| Comprobación | Resultado |
|---|---|
| `npm test` | PASS 21/21 (8 base + 9 solapes/Bogotá + 4 webhook) |
| `npm run typecheck` | PASS |
| `npm run build` | PASS (no acredita servicios) |
| `npm run test:e2e` (Chromium) | PASS 4/4 smoke + 3/3 sandbox MP (preferencia real, 200 permanente, HMAC→500) |
| Sandbox MP de veras | Pago APRO → webhook 200 → reserva CONFIRMED + pago APPROVED (luego cancelada) |
| Supabase remoto | `weekly` + `blocked_slots` + guardia antisolape aplicadas; `adjust_product_stock` probada |
| `npm run lint` | FAIL heredado: 43 errores, 55 advertencias (deuda, sin silenciar; bajó de 53/66) |
| Dominio conocido | HTTP 200 con contenido Ananda; **qué commit/entorno, desconocido** |

## Qué existe (código, no operación)

Tienda/servicios públicos (intentan Supabase, fallback a ejemplos); checkout de
servicio/producto (sin rifas: eliminadas PR #18); reservas con solapes
cubiertos y guardia antisolape en BD (`bookings_no_overlap_active` + trigger
`ends_at`); horas por día persistidas (`weekly`) y bloqueos reales
(`blocked_slots`); Mercado Pago (preferencia + webhook idempotente 200/500 +
stock atómico vía RPC) + pago manual con comprobante privado; admin (agenda,
clientes, catálogo, pagos, pedidos, configuración) más **parciales**:
`/admin/contenido` (GET vacío, POST `501`) y `/admin/reportes` + panel
(UI estática); cron de limpieza (2 jobs); enlaces WhatsApp; correo SMTP.
Modo demo con bypass administrativo, **fail-closed en producción** (PR #16).

## No comprobado / desconocido

Google Calendar real (credencial local inválida: `DECODER unsupported`;
el webhook lo tolera y confirma igual), Blob privado, SMTP real, cron remoto,
env/entorno desplegado en Vercel, Mercado Pago producción, rotación de
credenciales expuestas según reporte anterior.

## Deuda prioritaria

1. Auth/roles/RLS: roles de mínimo privilegio (#2) y confirmar RLS (#5).
2. Pagos: E2E manual y regla de parciales (sin definir).
3. Lint 43/55 (sin autorización para la deuda restante).
4. Disponibilidad (restos): UI de bloqueos, e2e de calendario.
5. Verificación remota restante: Vercel (lectura), Blob, SMTP, cron.
6. SEO/estructural, cuando la base operativa esté beta sólida.
