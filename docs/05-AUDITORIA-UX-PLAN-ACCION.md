---
title: Auditoría UX y Plan de Acción — Espíritu Ananda (storebasc)
date: 2026-07-25
estado: pendiente-validacion
skill-frontend-design: ~\.agents\skills\frontend-design
skill-web-design-guidelines: ~\.agents\skills\web-design-guidelines
skill-canvas-design: ~\.agents\skills\canvas-design
---

# Auditoría UX + Plan de Acción

## Contexto del Proyecto

- **Nombre**: Espíritu Ananda (storebasc)
- **Stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS v4, Firebase Firestore, Google Calendar API, NextAuth v5
- **Hosting**: Vercel (serverless) con soporte PWA
- **Marca**: Espiritual / mística — lecturas astrales, tarot, productos holísticos, rifas
- **Ubicación**: Cali, Colombia
- **Pagos**: Manual (transferencia + subida de comprobante) con opción a Wompi

---

## Skills Instaladas (sin conflictos entre sí)

| Skill | Fuente | Propósito |
|---|---|---|
| `find-skills` | vercel-labs/skills | Descubrimiento de skills |
| `frontend-design` | anthropics/skills | Dirección de diseño visual distintivo, evitar defaults genéricos de IA |
| `web-design-guidelines` | vercel-labs/agent-skills | Revisión de cumplimiento UI/Web — accesibilidad, formas, semántica |
| `canvas-design` | anthropics/skills | Creación de activos visuales artísticos (posters, PDF, PNG) |

---

## 1. HALLAZGOS DE AUDITORÍA UX

### 🟥 Alto Impacto — Debe corregirse antes de producción

#### 1.1 Fallos de Accesibilidad Múltiples

| ID | Archivo | Línea | Problema | Guía |
|---|---|---|---|---|
| A11Y-01 | `src/components/public/PublicHeader.tsx` | 39 | Emoji 🛍️ como icono de carrito sin `aria-hidden`. Tiene `aria-label` pero el emoji debe ocultarse de AT | WCAG 4.1.2 |
| A11Y-02 | `src/components/public/PublicHeader.tsx` | 62 | Menú hamburguesa usa caracteres Unicode (`☰`/`✕`) en lugar de SVG con `aria-hidden` | WCAG 1.1.1 |
| A11Y-03 | `src/components/public/PublicHeader.tsx` | 41-43 | Badge del carrito (`<span>`) sin `role="status"` ni `aria-live="polite"` | WCAG 4.1.3 |
| A11Y-04 | `src/components/admin/AdminSidebar.tsx` | — | Iconos de navegación (lucide-react) sin `aria-label` en enlaces | WCAG 4.1.2 |
| A11Y-05 | `src/app\(admin)\admin\page.tsx` | — | Botones de acción rápida sin descripción accesible | WCAG 4.1.2 |
| A11Y-06 | `src/app/(public)/layout.tsx` | — | Sin skip-link para navegación por teclado | WCAG 2.4.1 |
| A11Y-07 | `src\app\globals.css` | — | Animaciones sin `@media (prefers-reduced-motion)` | WCAG 2.3.3 |
| A11Y-08 | `src\app\(admin)\admin\agenda\page.tsx` | — | Modales sin manejo de foco (no atrapan foco, no cierran con Escape) | WCAG 2.4.3 |

#### 1.2 Sin Protección Contra Pérdida de Datos

| ID | Archivo | Problema |
|---|---|---|
| FORM-01 | `src/app/checkout/[serviceId]/Step1ClientForm.tsx` | No hay `beforeunload` ni router guard si el usuario navega hacia atrás |
| FORM-02 | `src/app/checkout/product/page.tsx` | Wizard de 4 pasos sin confirmación de salida |
| FORM-03 | `src/context/CartContext.tsx` | Usa `sessionStorage` sin advertencia de pérdida al cerrar pestaña |

#### 1.3 Estados de Carga/Vacío/Error Insuficientes

| ID | Archivo | Problema |
|---|---|---|
| STATE-01 | `src/app/page.tsx` | Landing sin Suspense boundaries para Services, Products, Raffles (efecto cascada) |
| STATE-02 | `src/components/Services.tsx` | Fetch from Firebase sin skeleton visible durante carga |
| STATE-03 | `src/components/Products.tsx` | Ídem |
| STATE-04 | `src/components/Raffles.tsx` | Ídem |
| STATE-05 | `src/app/checkout/[serviceId]/Step1ClientForm.tsx` | Submit sin indicador de carga (solo desactiva botón en paso 3) |
| STATE-06 | `src/app/checkout/[serviceId]/pay/page.tsx` | Error message se muestra pero no hay recovery guidance claro |

#### 1.4 PWA Incompleto

| ID | Archivo | Problema |
|---|---|---|
| PWA-01 | `public/manifest.webmanifest` | Sin `description`, `categories`, `screenshots`, `prefer_related_applications` |
| PWA-02 | `src/app/layout.tsx` | Sin `apple-touch-icon` ni meta tags iOS |
| PWA-03 | `public/sw.js` | Service worker genérico sin estrategia de caché offline |
| PWA-04 | `src/app/layout.tsx` | `themeColor` solo en metadata viewport, no vinculado al manifest |

---

### 🟡 Impacto Medio — Planificar en corto plazo

#### 2.1 Consistencia Visual Fragmentada

| ID | Archivo(s) | Problema |
|---|---|---|
| DESIGN-01 | `src/app/page.module.css` vs `tailwind` | Dos sistemas de estilo conviviendo: CSS Modules en landing, Tailwind en el resto |
| DESIGN-02 | Múltiples componentes | Colores hardcodeados (`bg-violet-600`, `text-[#2D1B69]`, `bg-emerald-600`) en vez de variables `--color-ananda-*` |
| DESIGN-03 | `src/components/ui/Button.tsx` | Variants usan colores hardcodeados en vez de tokens del theme |
| DESIGN-04 | `globals.css` | Solo define `--font-sans` e `--font-display`, sin jerarquía tipográfica (`type-scale`) |
| DESIGN-05 | Admin legacy `app/admin/reservas/page.tsx` | ~993 líneas con estilos inline y lógica plana sin componentes compartidos |

#### 2.2 UX de Checkout Fragmentada

| ID | Flujo | Pasos | Storage Key |
|---|---|---|---|
| CHECKOUT-01 | Servicios | 3 pasos | `ananda_checkout_data` |
| CHECKOUT-02 | Productos | 4 pasos | `ananda_cart` + `product_order` |
| CHECKOUT-03 | Rifas | 2 pasos | `raffle_order` |

- Cada flujo implementado por separado sin componentes compartidos
- Stepper de progreso NO es clickeable (no permite volver a pasos anteriores)
- Sin persistencia entre sesiones (sessionStorage se pierde al cerrar pestaña)

#### 2.3 Problemas de Rendimiento

| ID | Archivo | Problema |
|---|---|---|
| PERF-01 | `src/components/public/ProductCard.tsx` | Imágenes sin `loading="lazy"` |
| PERF-02 | `globals.css` | `scroll-behavior: smooth` puede causar jank |
| PERF-03 | Admin pages | `useEffect` + `fetch` sin caché ni SWR/React Query |
| PERF-04 | `checkout/product/page.tsx` | Múltiples `useState` → re-renders excesivos (usar `useReducer`) |

#### 2.4 Sin Deep Linking

| ID | Archivo | Problema |
|---|---|---|
| LINK-01 | `src/app/(admin)/admin/agenda/page.tsx` | Filtro de estado no se refleja en URL |
| LINK-02 | `src/app/(admin)/admin/pagos/page.tsx` | Filtro de estado no se refleja en URL |
| LINK-03 | Todos los admin | Modales abiertos no tienen estado en URL |

---

### 🟢 Bajo Impacto — Mejora continua

#### 3.1 Micro-copy y Detalles

| ID | Archivo | Problema | Corrección |
|---|---|---|---|
| COPY-01 | Múltiples | Placeholders sin `…` al final | `"Ej. Camila Rodríguez…"` |
| COPY-02 | Múltiples | `...` en vez de `…` (Unicode) | Reemplazar global |
| COPY-03 | Múltiples | Botones "Continuar" genéricos | Usar acción específica: "Ir a pagar", "Guardar datos" |
| COPY-04 | `checkout/success/page.tsx` | "Reserva Solicitada con Éxito" | "Reserva confirmada" (voz activa) |
| COPY-05 | `PublicHeader.tsx` | WhatsApp FAB sin tooltip | Agregar `title` |

#### 3.2 Responsive

| ID | Archivo | Problema |
|---|---|---|
| RSP-01 | `src/app/page.module.css` | Hero grid `1.15fr/0.85fr` sin media query para mobile |
| RSP-02 | `AdminSidebar.tsx` | Sin versión colapsable para tablets |
| RSP-03 | Admin tables | Sin scroll horizontal en mobile |
| RSP-04 | `AdminTopBar.tsx` | Search placeholder sin funcionalidad real |

#### 3.3 Seguridad UX

| ID | Archivo | Problema |
|---|---|---|
| SEC-01 | `src/lib/demoMode.ts` | Bypass de auth vía env vars. Verificar que no tenga efecto en producción |
| SEC-02 | `src/app/checkout/[serviceId]/pay/page.tsx` | Payment proof subido como base64 inline → migrar a `multipart/form-data` |
| SEC-03 | API routes | Base64 en POST puede saturar payloads |

---

## 2. WEB INTERFACE GUIDELINES — Checklist Vercel

Fuente: `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`

### Accesibilidad

- [ ] Icon-only buttons con `aria-label` — **FALTAN** (A11Y-01, A11Y-04, A11Y-05)
- [ ] Form controls con `<label>` o `aria-label` — **OK parcial** (algunos inputs sin label semántico explícito)
- [ ] Interactive elements con `onKeyDown`/`onKeyUp` — **REVISAR**
- [ ] `<button>` para acciones, `<a>`/`<Link>` para navegación — **OK parcial** (revisar `div` con onClick)
- [ ] Imágenes con `alt` — **OK** (Next.js Image obliga)
- [ ] Decorativos con `aria-hidden="true"` — **FALTAN**
- [ ] Async updates con `aria-live="polite"` — **FALTA** en FeedbackAlert
- [ ] Semantic HTML antes que ARIA — **REVISAR**
- [ ] Headings jerárquicos `<h1>`-`<h6>` y skip link — **FALTA skip link**
- [ ] `scroll-margin-top` en heading anchors — **FALTA**

### Focus States

- [ ] Visible focus: `focus-visible:ring-*` — **OK en formularios, REVISAR en admin**
- [ ] Sin `outline-none` sin reemplazo — **VERIFICAR**
- [ ] `:focus-visible` sobre `:focus` — **REVISAR**
- [ ] `:focus-within` para compound controls — **REVISAR**

### Forms

- [ ] `autocomplete` y `name` significativos — **FALTAN** en checkout
- [ ] `type` correcto (`email`, `tel`, `url`) — **OK**
- [ ] Sin bloqueo de paste — **OK**
- [ ] Labels clickeables (`htmlFor`) — **OK**
- [ ] Spellcheck deshabilitado en códigos — **REVISAR**
- [ ] Submit habilitado hasta request, spinner durante — **FALTA en Step1 y Step2**
- [ ] Errores inline junto a campos — **FALTA** (error general, no por campo)
- [ ] Placeholders terminan con `…` — **FALTAN**
- [ ] `beforeunload` con cambios sin guardar — **FALTA**

### Animation

- [ ] `prefers-reduced-motion` — **FALTA**
- [ ] `transform`/`opacity` only — **OK**
- [ ] Sin `transition: all` — **VERIFICAR**
- [ ] `transform-origin` correcto — **REVISAR**
- [ ] Animaciones interrumpibles — **REVISAR**

### Typography

- [ ] `…` no `...` — **FALTA**
- [ ] Curly quotes `""` no `""` — **FALTA**
- [ ] Non-breaking spaces (`&nbsp;`) — **REVISAR**
- [ ] Loading states con `…` — **FALTA en varios**
- [ ] `font-variant-numeric: tabular-nums` — **FALTA en precios**
- [ ] `text-wrap: balance` en headings — **FALTA**

### Content Handling

- [ ] Text containers con `truncate`/`break-words` — **OK parcial**
- [ ] Flex children con `min-w-0` — **REVISAR**
- [ ] Empty states — **OK en admin, FALTA en checkout**
- [ ] UGC anticipar largos — **REVISAR**

### Performance

- [ ] Imágenes con `width`/`height` — **OK (Next.js Image)**
- [ ] Below-fold con `loading="lazy"` — **FALTA en catálogo**
- [ ] Critical images con `priority` — **OK (hero logo)**
- [ ] Sin layout reads en render — **REVISAR**
- [ ] Preconnect para CDN — **FALTA**
- [ ] Critical fonts preload — **FALTA**

### Navigation & State

- [ ] URL refleja estado — **FALTA en admin**
- [ ] Links usan `<a>`/`<Link>` — **OK**
- [ ] Deep-link stateful UI — **FALTA**
- [ ] Destructive actions con confirmación — **OK (agenda)**

### Touch & Interaction

- [ ] `touch-action: manipulation` — **FALTA**
- [ ] `overscroll-behavior: contain` en modales — **FALTA**
- [ ] Sin `autoFocus` en mobile — **REVISAR**

### Safe Areas

- [ ] `env(safe-area-inset-*)` — **FALTA**
- [ ] Sin scrollbars no deseados — **REVISAR**

### Hover & Interactive States

- [ ] `hover:` state en todos — **OK**
- [ ] Increased contrast en hover/active/focus — **REVISAR**

---

## 3. FRONTEND-DESIGN — Evaluación de Identidad Visual

Basado en `anthropics/skills@frontend-design` — principios de diseño distintivo.

### Diagnóstico Actual

El diseño actual de Espíritu Ananda utiliza:
- Fondo claro (`#FAF8FF`)
- Acento violeta (`#7C3AED`)
- Glassmorphism en cards
- Tipografía Playfair Display + Inter

**Esto corresponde al perfil #2 de diseño AI-genérico** descrito en frontend-design: "fondo claro, acento violeta, glassmorphism". Aunque es limpio, carece de una identidad visual que no pueda ser confundida con otro sitio.

### Áreas de Mejora por Principio

#### 3.1 El Hero es una Tesis

**Estado actual**: Hero "El Nexo Celestial" con descripción funcional de 4 pasos. Es denso en texto, pobre en impacto visual.

**Acción requerida**: Abrir con el elemento más característico del mundo espiritual — una animación de constelación, un tarot que se revela, un aura animada alrededor del logo. El texto debe ser mínimo, la experiencia visual máxima.

#### 3.2 Tipografía con Personalidad

**Estado actual**: Playfair Display + Inter. Combinación segura, pero usada por miles de sitios.

**Acción requerida**: Explorar una variable tipográfica más osada y específica para la marca:
- Display: algo ritual, cósmico (ej. Syne, Instrument Serif, Cormorant Garamond)
- Body: mantener legibilidad (Inter ok, pero considerar proporción)
- Utility: para datos numéricos, tablas (monospace con personalidad)

#### 3.3 Estructura Informativa

**Estado actual**: La landing usa marcadores numerados (implícitos en el flujo de 4 pasos en `page.tsx:57-61`).

**Advertencia de frontend-design**: Los números secuenciales solo tienen sentido si el contenido ES una secuencia real. Los 4 pasos del flujo comercial SÍ son un proceso secuencial real → mantener numeración.

#### 3.4 Firma Visual Única

**Estado actual**: No hay un elemento signature. El sitio es correcto pero no memorable.

**Acción requerida**: Crear UN elemento que sea la firma visual de Espíritu Ananda:
- Opción A: Partículas estelares interactivas que siguen al cursor
- Opción B: Una "aura" animada alrededor del logo central
- Opción C: Texturas orgánicas de fondo (papel artesanal, pergamino cósmico)
- Opción D: Ilustraciones custom de los arcanos del tarot

#### 3.5 Riesgo Estético

**frontend-design dice**: "Toma UN riesgo real. No hacerlo también es un riesgo."

El riesgo recomendado: Incorporar **texturas orgánicas reales** (scan de papel texturizado, fotografías de velas, humo de sahumerio) como fondos y elementos visuales. Esto rompe inmediatamente con la estética AI-generada.

---

## 4. CANVAS-DESIGN — Oportunidades de Activos Visuales

Basado en `anthropics/skills@canvas-design` — creación de arte visual en PNG/PDF.

### 4.1 Poster de Servicios

Crear一张 poster en PDF/PNG para cada servicio astral usando filosofía "Geometric Silence" o "Concrete Poetry":
- Servicios: Carta Natal, Tarot Express, Revolución Solar, Sinastría de Pareja, Tarot Terapéutico, Tránsitos Planetarios
- Cada poster: 90% visual, 10% texto esencial
- Tipografía como elemento visual, no vehículo de contenido
- Usar como OG images, assets descargables, contenido para redes

### 4.2 Certificado de Lectura Post-Sesión

PDF descargable post-compra con:
- Nombre del consultante
- Tipo de lectura
- Fecha y hora
- Diseño filosófico con la identidad de marca
- Número de certificado único

### 4.3 Arte para Redes Sociales

Integrar con el generador de contenido IA existente en `/admin/contenido`:
- Formatos: 9:16 (stories), 1:1 (feed), 1.91:1 (landscape)
- 6 estilos presets de la filosofía Ananda
- Aprobación/rechazo desde el panel admin

### 4.4 Brand Manifesto PDF

Documento PDF con la filosofía visual de "Espíritu Ananda":
- Manifiesto de diseño
- Paleta cromática expandida
- Guía de uso tipográfico
- Ejemplos de composición visual

---

## 5. PLAN DE EJECUCIÓN POR FASES

### Fase 1 — Quick Wins (Accesibilidad + Estabilidad)
*Esfuerzo: 1-2 días | Prioridad: Crítica*

| # | Tarea | Archivos Afectados | Criterio de Aceptación |
|---|---|---|---|
| 1.1 | Agregar `aria-label` a todos los icon-buttons | `PublicHeader.tsx`, `AdminSidebar.tsx`, `admin/page.tsx`, agenda, pagos | Lighthouse AX 100% en iconos |
| 1.2 | Agregar `prefers-reduced-motion` | `globals.css`, `page.module.css` | No hay animaciones con `prefers-reduced-motion: reduce` |
| 1.3 | Agregar `beforeunload` en checkout | `checkout/[serviceId]/Step1ClientForm.tsx`, `checkout/product/page.tsx` | Confirmación al navegar hacia atrás |
| 1.4 | Agregar `autocomplete` attributes | Todos los forms de checkout | Autocompletado funciona en Chrome/Safari |
| 1.5 | Reemplazar `...` por `…` y `""` rectas por curvas | Global search & replace | Sin instancias de `...` |
| 1.6 | Agregar Suspense boundaries en landing | `app/page.tsx` | Cada sección se carga independientemente |
| 1.7 | Agregar `role="status"` + `aria-live="polite"` en badge carrito | `PublicHeader.tsx` | Screen reader anuncia cambios |
| 1.8 | Agregar manejo de foco en modales admin | `agenda/page.tsx`, `clientes/page.tsx`, `pagos/page.tsx` | Tab navigation cíclica, Escape cierra |

### Fase 2 — Rediseño Visual Estratégico
*Esfuerzo: 3-5 días | Prioridad: Alta*

| # | Tarea | Guía frontend-design | Archivos Afectados |
|---|---|---|---|
| 2.1 | Definir firma visual única (signature element) | "Gastar audacia en UN solo lugar" | `app/page.tsx`, nuevo componente |
| 2.2 | Redefinir hero: minimalista + impactante | "Hero es una tesis" | `app/page.tsx`, `page.module.css` |
| 2.3 | Explorar y definir nueva pareja tipográfica | "Tipografía lleva la personalidad" | `globals.css`, `layout.tsx` |
| 2.4 | Crear type-scale completo | — | `globals.css` |
| 2.5 | Reemplazar colores hardcodeados por `--color-ananda-*` | — | Todos los componentes |
| 2.6 | Unificar sistema de componentes (CSS Modules → Tailwind) | — | `page.module.css`, componentes landing |
| 2.7 | Agregar texturas orgánicas reales | "El riesgo estético" | `globals.css`, fondos |

### Fase 3 — Consolidación de UX
*Esfuerzo: 3-5 días | Prioridad: Alta*

| # | Tarea | Guía | Archivos Afectados |
|---|---|---|---|
| 3.1 | Unificar flujos de checkout en wizard reutilizable | web-design-guidelines | `checkout/*` |
| 3.2 | Implementar React Query/SWR | web-design-guidelines (perf) | Admin pages |
| 3.3 | Deep linking en admin (filtros/tabs en URL) | web-design-guidelines (nav) | `agenda/page.tsx`, `pagos/page.tsx` |
| 3.4 | Agregar `aria-live` regions para FeedbackAlert | web-design-guidelines | `FeedbackAlert.tsx` |
| 3.5 | Completar PWA (manifest, icons, service worker) | web-design-guidelines | `public/`, `layout.tsx` |
| 3.6 | Agregar `loading="lazy"` a imágenes de catálogo | web-design-guidelines (perf) | `ProductCard.tsx`, catálogos |
| 3.7| Agregar `font-variant-numeric: tabular-nums` en precios | web-design-guidelines (typo) | Componentes de precio |
| 3.8 | Agregar preconnect para Firebase/Fonts | web-design-guidelines (perf) | `layout.tsx` |

### Fase 4 — Activos Visuales Premium
*Esfuerzo: 2-3 días | Prioridad: Media*

| # | Tarea | Guía canvas-design | Archivos Afectados |
|---|---|---|---|
| 4.1 | Poster PDF por servicio astral | Filosofía "Geometric Silence" | Nuevos assets en `/public/` |
| 4.2 | Certificado post-sesión en PDF | Filosofía "Concrete Poetry" | Nuevo endpoint + template |
| 4.3 | Integrar canvas-design con generador de contenido IA | Filosofías variables | `admin/contenido/page.tsx` |
| 4.4 | Brand manifesto PDF | Filosofía propia de marca | Nuevo asset |

### Fase 5 — Deuda Técnica
*Esfuerzo: 3-4 días | Prioridad: Media-Baja*

| # | Tarea | Archivos Afectados |
|---|---|---|
| 5.1 | Migrar admin legacy SPA a nuevo sistema | `admin/reservas/page.tsx` |
| 5.2 | Migrar base64 uploads a `multipart/form-data` | APIs de bookings/orders |
| 5.3 | Agregar manejo de error granular en formularios | Todos los forms |
| 5.4 | Reemplazar `<CartDrawer>` import roto | Verificar import path |
| 5.5 | Agregar `overscroll-behavior: contain` a modales | Modales admin |
| 5.6 | Agregar `touch-action: manipulation` a interactive elements | `globals.css` |

---

## 6. MAPA DE ARCHIVOS CRÍTICOS

```
src/
├── app/
│   ├── layout.tsx                    # Root layout, metadata, viewport
│   ├── globals.css                   # Theme tokens, utilities, animaciones
│   ├── page.tsx                      # Landing page (hero + secciones)
│   ├── page.module.css               # Estilos landing (CSS Modules)
│   ├── (public)/
│   │   ├── layout.tsx                # Public shell (header + footer + cart)
│   │   ├── servicios/
│   │   │   ├── page.tsx              # Catálogo de servicios
│   │   │   ├── ServicesCatalogClient.tsx
│   │   │   └── loading.tsx
│   │   └── tienda/
│   │       ├── page.tsx              # Catálogo de productos
│   │       ├── StoreCatalogClient.tsx
│   │       └── loading.tsx
│   ├── checkout/
│   │   ├── [serviceId]/
│   │   │   ├── page.tsx              # Checkout servicios paso 1
│   │   │   ├── page.module.css
│   │   │   ├── Step1ClientForm.tsx
│   │   │   ├── schedule/page.tsx    # Checkout servicios paso 2
│   │   │   └── pay/page.tsx         # Checkout servicios paso 3
│   │   ├── product/
│   │   │   ├── page.tsx             # Checkout productos (4 pasos)
│   │   │   └── pay/page.tsx
│   │   ├── raffle/
│   │   │   ├── page.tsx             # Checkout rifas paso 1
│   │   │   └── pay/page.tsx
│   │   └── success/page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx               # Admin shell (sidebar + topbar)
│   │   └── admin/
│   │       ├── page.tsx             # Dashboard
│   │       ├── agenda/page.tsx      # Gestión de reservas
│   │       ├── clientes/page.tsx    # CRM
│   │       ├── pagos/page.tsx       # Validación pagos
│   │       ├── pedidos/page.tsx     # Pedidos
│   │       ├── catalogo/page.tsx    # Catálogo
│   │       ├── rifas/page.tsx       # Rifas
│   │       ├── contenido/page.tsx   # Generador IA
│   │       ├── reportes/page.tsx    # Reportes
│   │       └── configuracion/page.tsx
│   └── login/page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── LoadingState.tsx
│   │   ├── EmptyState.tsx
│   │   └── FeedbackAlert.tsx
│   ├── public/
│   │   ├── PublicHeader.tsx
│   │   ├── PublicFooter.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── ProductCard.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   └── CartDrawer.tsx (import roto — verificar)
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   └── AdminTopBar.tsx
│   ├── Services.tsx
│   ├── Products.tsx
│   ├── Raffles.tsx
│   ├── ToggleView.tsx
│   ├── About.tsx
│   └── CartContext.tsx (en context/ en realidad)
└── context/
    └── CartContext.tsx
```

---

## 7. MÉTRICAS OBJETIVO

| Métrica | Actual | Objetivo | Fase |
|---|---|---|---|
| Lighthouse Accessibility | ~75 (estimado) | 95+ | F1 |
| Lighthouse Performance | ~70 (estimado) | 90+ | F3 |
| Lighthouse Best Practices | ~80 (estimado) | 95+ | F1+F3 |
| Tiempo de carga perceived | ~3s (estimado) | <1.5s | F3 |
| Cumulative Layout Shift (CLS) | Desconocido | <0.1 | F1+F3 |
| First Input Delay (FID) | Desconocido | <100ms | F3 |
| Tasa de conversión checkout | Desconocido | +20% | F2+F3 |

---

## 8. RECOMENDACIONES ADICIONALES

### 8.1 Gobernanza de Diseño
- Migrar todos los colores a tokens CSS `--color-*` y prohibir hardcodeos
- Establecer un type-scale en `globals.css` (ej. `--text-xs` a `--text-7xl`)
- Definir un componente `Button` unificado (ya existe pero con colores hardcodeados)

### 8.2 Testing
- Agregar tests E2E con Playwright para los 3 flujos de checkout
- Agregar tests de accesibilidad con `@axe-core/playwright`
- Agregar tests de regresión visual con Playwright screenshot

### 8.3 Monitoreo Post-Lanzamiento
- Google Analytics / Vercel Analytics para funnel de conversión
- Seguimiento de abandonment en checkout
- Heatmaps (Hotjar/MS Clarity) para entender comportamiento en landing

---

## 9. DEPENDENCIAS Y RIESGOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Cambios en Firebase API | Baja | Alto | Mantener SDK actualizado |
| Wompi requiere homologación | Media | Alto | Tener manual provider como fallback |
| Google Calendar rate limits | Baja | Medio | Cachear availability slots |
| sessionStorage se pierde | Alta | Medio | Migrar a localStorage con advertencia |
| Diseño visual muy diferente al actual | Media | Alto | Iterar con feedback del cliente real |

---

*Documento generado el 2026-07-25 para validación por agente. Skills instaladas en `~\.agents\skills\`*
