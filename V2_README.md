# AnandaStore V2 — Rediseño completo

## Rama de trabajo
`redesign/ananda-v2` — creada desde `main` el 14 Jul 2026.

## Objetivo
Reconstrucción completa del CRM/Ecommerce para Espíritu Ananda:
- Sitio público: servicios astrales + tienda artesanal
- Área cliente: reservas, pedidos, historial
- Panel administrativo: agenda, clientes, pagos, catálogo, reportes, IA

## Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth v5
- Google Calendar API
- Gemini AI (generación de tarjetas)
- Vercel (despliegue)

## Ramas
```
main                        # Producción actual V1
redesign/ananda-v2          # Base de trabajo V2
feature/v2-design-system    # Sistema de diseño
feature/v2-database         # Esquema y migraciones
feature/v2-bookings         # Reservas y agenda
feature/v2-payments         # Pagos
feature/v2-store            # Tienda y pedidos
feature/v2-dashboard        # Panel principal
feature/v2-ai-assets        # Generación de creatividades IA
```

## Variables de entorno
Ver `.env.example` para la lista completa de variables requeridas.

## Sprints
1. **Foundation** — Arquitectura, UI base, BD, roles ✅
2. **Agenda + Clientes** — Servicios, reservas, Calendar, WhatsApp
3. **Pagos** — Manual + pasarela intercambiable
4. **Tienda** — Catálogo, carrito, checkout, pedidos
5. **Dashboard** — KPIs, agenda diaria, acciones
6. **IA Comercial** — Tarjetas, aprobación, biblioteca
7. **Lanzamiento** — Migración, pruebas, v2.0.0
