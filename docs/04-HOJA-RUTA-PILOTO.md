# Hoja de Ruta — Camino a Pruebas de Uso Real (Piloto)

**Fecha:** 2026-08-12
**Objetivo:** Llevar AnandaStore V2 de "plataforma validada en sandbox" a "primeras ventas reales con Lina" en el menor tiempo posible, sin sacrificar seguridad ni confianza en los datos.

---

## 0. Estado Actual (Punto de Partida)

| Área | Estado |
| :--- | :--- |
| Reserva de citas + pago Mercado Pago (sandbox) | ✅ Validado E2E (2 ventas: $116.000 y $85.000) |
| Webhook MP → booking CONFIRMED + evento Google Calendar + correo + link WhatsApp | ✅ Validado (fix de asistentes sin DWD aplicado) |
| Supabase: servicios/agenda/clientes reales, RLS auditado | ✅ Verificado (14 policies) |
| Autenticación real (Supabase Auth + NextAuth v5), sin acceso demo | ✅ Operativo |
| CRM / Dashboard sin datos simulados | ✅ Limpio (estados vacíos con contexto) |
| Rifas y Contenido IA | ⚠️ UI completa, **sin backend** (APIs vacías/501 honestos) |
| Dashboard / Reportes con métricas | ⚠️ Muestran estados vacíos (aún sin agregaciones reales) |
| Disponibilidad de horarios (`/api/availability`) | ⚠️ Franjas con valores por defecto (pendiente conectar a configuración real) |
| Webhook MP en producción | ⚠️ Requiere dominio público + `MERCADOPAGO_WEBHOOK_SECRET` + verificación de firma |
| Pago manual (Nequi/Daviplata/Bancolombia) | ⚠️ Sin validar E2E completo (subida comprobante → verificación admin → evento) |
| Tienda (pedidos con MP) | ⚠️ Sin validar E2E |
| Credenciales reales de Lina | ❌ Pendiente (SMTP, calendario, token MP producción, cuentas bancarias) |

---

## 1. Fase P1 — Cierre de Pendientes Técnicos (3-4 días)

**Criterio de salida:** el panel muestra solo información real; no quedan horarios ni datos por defecto visibles al cliente.

| # | Tarea | Detalle |
| :--- | :--- | :--- |
| P1.1 | **Disponibilidad real** | Conectar `/api/availability` a `availability_settings` (y opcionalmente a Google Calendar freebusy) para que el cliente solo vea franjas reales. |
| P1.2 | **Dashboard con métricas reales** | Conectar `/admin` a Supabase: citas de hoy, comprobantes por verificar, alertas de inventario, ingresos del mes. |
| P1.3 | **Decisión Rifas + Contenido IA** | Elegir: (a) ocultar del menú hasta tener backend, o (b) construir backend de rifas (tablas + compra de boletos) y motor de imágenes IA. **Recomendado para el piloto: (a)**. |
| P1.4 | **Webhook de producción** | Desplegar en Vercel, generar `MERCADOPAGO_WEBHOOK_SECRET` en el panel de MP, activar validación de firma y probar el primer pago real de extremo a extremo. |
| P1.5 | **Migración middleware → proxy** | Eliminar la advertencia de Next.js 16 (convención `proxy`) para dejar el build limpio. |
| P1.6 | **Pre-requisito Vercel** | Configurar todas las variables de `docs/VERCEL-VARIABLES-GUIDE.md` en el proyecto Vercel (secretos incluidos). |

## 2. Fase P2 — Validaciones E2E Faltantes (4-5 días)

**Criterio de salida:** los 3 caminos de compra del negocio funcionan de principio a fin en sandbox y en manual.

| # | Tarea | Detalle |
| :--- | :--- | :--- |
| P2.1 | **Pago manual completo** | Cliente agenda → elige Nequi/Daviplata/transferencia → sube comprobante → admin verifica en `/admin/pagos` → booking CONFIRMED + evento calendario + correo. Validar ambos estados (aprobar/rechazar). |
| P2.2 | **Tienda E2E** | Compra de producto con carrito → checkout 4 pasos → pago MP → pedido CONFIRMED → correo + descuento de inventario. |
| P2.3 | **Auth en navegador** | Probar registro con correo/cédula, OTP de 6 dígitos, recuperación de clave y login por cédula en el navegador real (con sesión MP cerrada para no bloquear el checkout). |
| P2.4 | **Cron de limpieza** | Verificar que `/api/cron/cleanup` libera citas reservadas sin pagar (>30 min) y que `CRON_SECRET` está activo en Vercel. |
| P2.5 | **Reportes** | Conectar `/admin/reportes` a las agregaciones reales (ventas, medios de pago, distribución) ahora que el dashboard ya tiene datos. |

## 3. Fase P3 — Credenciales Reales y Piloto con Lina (1 semana)

**Criterio de salida:** Lina realiza sus primeras ventas reales sin intervención de Diego para operar el sistema.

| # | Tarea | Detalle |
| :--- | :--- | :--- |
| P3.1 | **Checklist de Lina** | Entregar/cerrar `docs/CHECKLIST-CLIENTE-REQUISITOS.md`: SMTP Gmail (J1), calendario de Lina (J2), token MP producción `APP_USR` (J4), cuentas bancarias y WhatsApp oficial. |
| P3.2 | **Conmutación a real** | Reemplazar credenciales sandbox por las de producción; `NEXT_PUBLIC_DEMO_MODE="false"` (ya lo está); confirmar que el login no ofrece acceso demo. |
| P3.3 | **Piloto controlado** | Pruebas con la primera semana de ventas reales de Lina: monitorear webhook, eventos de calendario, correos y conciliación en `/admin/pagos`. |
| P3.4 | **Dominio (L2)** | Certificar `espiritananda.com` en Vercel y apuntar DNS. |
| P3.5 | **Correcciones del piloto** | Bitácora en `docs/BUGS-FOUND.md`; arreglos priorizados por severidad (P1/P2/P3). |

## 4. Fase P4 — Post-Piloto / Escalado (según resultados)

| # | Tarea | Detalle |
| :--- | :--- | :--- |
| P4.1 | **WhatsApp (K1 refinado)** | Pulir el mensaje prediligenciado con resumen de pago y cita; evaluación de envío automático. |
| P4.2 | **Rifas / Contenido IA** | Revisar si el negocio los necesita (solo si el piloto lo justifica). |
| P4.3 | **PWA / rendimiento móvil (K2-K3)** | Canceladas por decisión del usuario; re-evaluar solo si los clientes lo piden. |
| P4.4 | **Métricas de negocio** | Reportes mensuales (ingresos por servicio/producto, ticket promedio, tasa de conversión). |

---

## 5. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Entregar sin cerrar P1.1/P1.4 | Cliente ve horarios falsos o pagos sin confirmar | P1 es obligatorio antes del piloto |
| Credenciales de Lina tardan | Piloto se atrasa | Preparar todo lo demás en paralelo; checklist claro |
| Webhook falla en producción | Ventas pagadas sin confirmar | `MERCADOPAGO_WEBHOOK_SECRET` + monitoreo de logs en Vercel los primeros días |
| Rifas/IA sin backend visibles | Percepción de producto incompleto | Ocultar del menú hasta implementar (P1.3-a) |

## 6. Decisión de Alcance para el Piloto (recomendado)

**Alcance mínimo viable del piloto:** Servicios + reservas + Mercado Pago + pago manual + tienda + panel admin (agenda, clientes, pagos, pedidos, catálogo, configuración). **Fuera del piloto:** Rifas, Contenido IA, Reportes avanzados (se ocultan del menú o se marcan "próximamente").
