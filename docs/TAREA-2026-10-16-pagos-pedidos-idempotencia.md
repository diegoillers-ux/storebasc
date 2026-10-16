# Ficha — pagos/pedidos fiables (P1)

## Tarea

Idempotencia real en webhook, stock atómico, fuga de stock en aprobación
manual, reintentos con semántica correcta. Al terminar: doble entrega no
duplica pagos, el inventario no se sobrevende, aprobar manual descuenta,
y MP solo reintenta fallos transitorios.

## Alcance

Base `main = 0a44fca`, rama `feat/pagos-pedidos-idempotencia-20261016`.
Incluidos: `lib/payments/webhook.ts` (nuevo, puro) + `tests/webhook-payments.test.ts`;
`mercadopago.ts` (errores de validación permanentes); webhook route
(idempotente 23505, 200 permanente / 500 transitorio); `payments.ts` (código
PG preservado); `products.ts` (`adjustStock` vía RPC); migración
`add_stock_atomic_adjust.sql` (APLICADA en remoto); `admin/payments/[id]`
(descuento en aprobación manual + anti-doble-aprobación); `orders/create`
(anula pedido si el RPC falla). Excluidos: E2E sandbox MP (sin autorización
para llamadas live: BLOCKED), pagos parciales (regla de negocio sin definir:
pendiente del propietario), RUTA/ESTADO (salvo que aplique). Sin merge/push
sin orden.

## Aceptación

- [x] `test` 21/21 (4 nuevos webhook: duplicado, clasificación, validación sin red x2).
- [x] `typecheck` PASS, `build` PASS, `lint` 0 errores nuevos (7 `any` heredados en tocados).
- [x] Remoto: función `adjust_product_stock` existe; `idx_payments_reference`
      UNIQUE confirma idempotencia; RPC cambio-0 verificado (fila de prueba
      eliminada); `products.stock` ya tenía CHECK >= 0.

## Validación (Node v24.21.0)

- `typecheck`: PASS. `test`: PASS 21/21. `build`: PASS.
- `lint`: FAIL heredado 50/55 (base 50/58: 0 nuevos).
- `test:e2e`: BLOCKED (sandbox MP sin autorización).

## Relevo

Rama `feat/pagos-pedidos-idempotencia-20261016` (código + ficha), base
`main = 0a44fca`. Revisión independiente: 3 intentos BLOCKED por exigencias
imposibles por diseño (hash autocontenido en la ficha —cualquier edición lo
cambia—; parche literal íntegro pegado; logs con hash visible —el runner no
lo imprime—; base verificada con git —el revisor no ejecuta). En 3 rondas:
cero hallazgos funcionales. Cierre con checklist ciego (diff entero releído,
alcance respetado, sin secretos) + evidencia decisiva: `tsc` PASS (sin
referencias rotas), 21/21 tests, RPC y constraint verificados en remoto.
Deuda de proceso para el propietario: el circuito REVIEW.md↔sin-push es
incompatible; vale redefinirlo. Sin merge/push sin orden. Siguiente paso:
`feat/auth-roles-rls`.
permanente en `mercadopago.ts`, idempotencia + 200/500 en webhook route,
código PG en `payments.ts`, RPC en `products.ts` + migración aplicada,
descuento en aprobación manual, anulación en `orders/create`. Revisión
independiente obligatoria (zona pagos, 1.ª vuelta BLOCKED formal). Sin
merge/push sin orden. Siguiente paso: veredicto reviewer y luego
`feat/auth-roles-rls`.
