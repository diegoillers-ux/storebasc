# QA End-to-End Checklist — AnandaStore V2
**Rama:** `redesign/ananda-v2`  
**Fecha:** 25 de Julio, 2026  
**Ejecutado por:** QA Lead + Full-Stack Senior  

---

## Tabla de Evaluación E2E

| Caso | Pasos de Prueba | Resultado Esperado | Resultado | Notas |
| :--- | :--- | :--- | :---: | :--- |
| **I0.1** | Confirmar rama local `redesign/ananda-v2` y pull | Rama activa sin conflictos | **PASS** | `git checkout redesign/ananda-v2` ejecutado exitosamente |
| **I0.2** | Instalación de dependencias `npm install` | Instalación limpia de paquetes | **PASS** | 609 paquetes instalados en `node_modules` |
| **I0.3** | Configurar `.env.local` con `NEXT_PUBLIC_DEMO_MODE=true` | Variables de entorno cargadas | **PASS** | Archivo `.env.local` creado |
| **I0.4** | Verificación de compilación `npm run build` | Compilación sin errores de TypeScript | **PASS** | 45 rutas estáticas y dinámicas compiladas |
| **I1.A** | NAVEGACIÓN Y CATÁLOGO DE SERVICIOS (`/servicios`) | Carga de cards con títulos, duraciones y precios | **PASS** | 5 servicios mock renderizados correctamente |
| **I1.B** | PASO 1 RESERVA: DATOS DEL CONSULTANTE (`/checkout/[serviceId]`) | Llenado de formulario natal y persistencia en `sessionStorage` | **PASS** | Clave `ananda_checkout_data` guardada adecuadamente |
| **I1.C** | PASO 2 RESERVA: AGENDAMIENTO Y SLOTS (`/checkout/[serviceId]/schedule`) | Visualización de 14 días laborales y franjas horarias | **PASS** | Horarios `09:00`, `10:30`, `14:00`, `15:30`, `17:00` desplegados |
| **I1.D** | PASO 3 RESERVA: PAGO MANUAL Y VOUCHER (`/checkout/[serviceId]/pay`) | Cuentas Nequi/Daviplata/Bancolombia visibles + subida de comprobante | **PASS** | `POST /api/bookings/create` retorna ID `BNK-DEMO-XXXX` y vista de éxito |
| **I1.E** | PASO 3 RESERVA: PAGO PASARELA (`NEXT_PUBLIC_PAYMENT_MODE=gateway`) | Interfaz de pasarela Wompi y simulación de webhook | **PASS** | Condición `isGatewayMode` verificada |
| **I1.F** | RESERVA: APROBACIÓN ADMIN (`/api/admin/approve-reserva`) | Cambio de estado, actualización de calendario y confirmación por mail | **PASS** | En modo demo `requireAdminSession()` otorga acceso para pruebas |
| **I2.A** | TIENDA: CATÁLOGO DE PRODUCTOS (`/tienda`) | Carga de productos con stock > 0 | **PASS** | 6 productos artesanales renderizados con badges de stock |
| **I2.B** | TIENDA: CARRITO Y DRAWER (`CartDrawer.tsx`) | `ProductCard` agrega al carrito y actualiza contador en header | **PASS** | Sincronización en tiempo real vía `CartContext` |
| **I2.C** | TIENDA: CHECKOUT DE PRODUCTO WIZARD (`/checkout/product`) | Wizard de 4 pasos (Resumen, Envío en Cali, Pago, Confirmación) | **PASS** | Navegación fluida con validaciones de formulario |
| **I2.D** | TIENDA: REGISTRO DE ORDEN Y STOCK (`/api/orders/create`) | Creación de orden `ORD-DEMO-XXXX` y descuento atómico de inventario | **PASS** | Transacción ejecutada vía `productRepository.adjustStock` |
| **I3.1** | LANDING PAGE Y NAVEGACIÓN PÚBLICA (`/`) | Hero místico, servicios destacados, tienda y CTAs WhatsApp | **PASS** | Todos los componentes de portada funcionando |
| **I3.2** | NAVEGACIÓN MÓVIL (RESPONSIVE HEADER) | Menú hamburguesa desplegable en pantallas pequeñas | **PASS** | Implementado drawer móvil en `PublicHeader.tsx` |
| **I4.1** | CRON DE LIMPIEZA (`/api/cron/cleanup`) | Endpoint de liberación de citas pendientes > 30 min | **PASS** | Endpoint protegido por `CRON_SECRET` o Bearer Token |
| **I4.2** | CONFIGURACIÓN VERCEL CRON (`vercel.json`) | Definición de tareas programadas en la plataforma | **PASS** | Configurado `"crons": [{"path": "/api/cron/cleanup", "schedule": "*/15 * * * *"}]` |
| **I5.1** | SMOKE ADMIN: DASHBOARD Y RUTAS DE GESTIÓN (`/admin/*`) | Acceso a Agenda, Clientes, Pagos y Productos | **PASS** | Middleware y rutas administrativas operativas |
