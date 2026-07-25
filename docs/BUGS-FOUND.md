# Reporte de Hallazgos y Correcciones de QA — AnandaStore V2
**Fecha:** 25 de Julio, 2026  
**Proyecto:** AnandaStore V2  
**Rama:** `redesign/ananda-v2`  

---

## Resumen de Vulnerabilidades & Defectos Detectados

| ID | Severidad | Descripción del Defecto | Archivo Afectado | Estado |
| :---: | :---: | :--- | :--- | :---: |
| **BUG-01** | **P1** | `isDemoMode()` no evaluaba la variable `NEXT_PUBLIC_DEMO_MODE=true` especificada en la convención Next.js del proyecto. | `src/lib/demoMode.ts` | **FIXED** |
| **BUG-02** | **P2** | Falta de mensaje de validación y botón de reinicio en `/checkout/[serviceId]/pay` si `sessionStorage` está vacío al ingresar directamente. | `src/app/checkout/[serviceId]/pay/page.tsx` | **FIXED** |
| **BUG-03** | **P1** | `vercel.json` contenía `"crons": []` vacío, impidiendo la ejecución programada de la limpieza de citas vencidas en Vercel. | `vercel.json` | **FIXED** |
| **BUG-04** | **P1** | `PublicHeader.tsx` no contaba con un menú hamburguesa desplegable para navegación móvil en pantallas menores a `md`. | `src/components/public/PublicHeader.tsx` | **FIXED** |

---

## Detalles de los Fixes Aplicados

### 1. BUG-01 — Soporte Completo para `NEXT_PUBLIC_DEMO_MODE`
- **Diagnóstico:** `isDemoMode()` verificaba únicamente `process.env.DEMO_MODE` o `process.env.NEXT_PUBLIC_BYPASS_AUTH`.
- **Solución:** Se incluyó `process.env.NEXT_PUBLIC_DEMO_MODE === 'true'` en las condiciones principales.
- **Commit:** `fix(demo): incluir NEXT_PUBLIC_DEMO_MODE en isDemoMode()`

### 2. BUG-02 — Validación de Sesión de Reserva en Paso de Pago
- **Diagnóstico:** Si el cliente accedía directamente a `/pay` o su sesión se borraba, el botón de envío no mostraba retroalimentación de error.
- **Solución:** Se agregó validación explícita con mensaje descriptivo pidiendo al cliente regresar al Paso 1 para ingresar sus datos.
- **Commit:** `fix(checkout): validar checkoutData en paso de pago y mostrar alerta`

### 3. BUG-03 — Programación de Cron Job en Vercel
- **Diagnóstico:** El endpoint `/api/cron/cleanup` estaba construido pero no registrado en `vercel.json`.
- **Solución:** Se añadió la directiva de cron a `vercel.json` (`*/15 * * * *`).
- **Commit:** `fix(cron): configurar horario de limpieza programada en vercel.json`

### 4. BUG-04 — Menú Móvil Responsivo en Encabezado
- **Diagnóstico:** En dispositivos móviles, los enlaces a `/servicios` y `/tienda` no eran accesibles en el encabezado.
- **Solución:** Se incorporó el estado `mobileMenuOpen` y un menú desplegable responsivo.
- **Commit:** `fix(ui): agregar menú hamburguesa móvil en PublicHeader`
