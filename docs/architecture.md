# Arquitectura AnandaStore V2

## Estructura de rutas

```
app/
├── (public)/           # Sitio público — sin prefijo en URL
│   ├── page.tsx        → /
│   ├── servicios/      → /servicios
│   ├── tienda/         → /tienda
│   ├── carrito/        → /carrito
│   ├── checkout/       → /checkout
│   ├── reserva/        → /reserva
│   └── como-funciona/  → /como-funciona
│
├── (customer)/         # Área privada del cliente
│   ├── mis-reservas/   → /mis-reservas
│   ├── mis-pedidos/    → /mis-pedidos
│   └── perfil/         → /perfil
│
├── (admin)/            # CRM — requiere sesión administrativa
│   └── admin/
│       ├── page.tsx    → /admin (dashboard)
│       ├── agenda/
│       ├── clientes/
│       ├── ventas/
│       ├── pagos/
│       ├── pedidos/
│       ├── catalogo/
│       ├── contenido/
│       ├── reportes/
│       └── configuracion/
│
└── api/
    ├── auth/           # NextAuth handlers
    ├── bookings/       # CRUD de reservas
    ├── calendar/       # Disponibilidad y eventos
    ├── payments/       # Iniciar pago, subir comprobante
    ├── webhooks/       # Pasarela de pago (firmados)
    ├── orders/         # Pedidos de tienda
    └── ai/             # Generación de creatividades
```

## Estados de reserva

```
DRAFT → PENDING_PAYMENT → PAYMENT_SUBMITTED → CONFIRMED → COMPLETED
                                          ↓              ↓
                                       CANCELLED      NO_SHOW
                        ↕
                    RESCHEDULED
```

## Estados de pedido

```
NEW → PAYMENT_PENDING → PAYMENT_SUBMITTED → PAID → PREPARING → READY/SHIPPED → DELIVERED
                                         ↓
                                      CANCELLED
```

## Decisiones técnicas

| Decisión | Elección | Razón |
|---|---|---|
| ORM | Prisma | Tipado fuerte, migraciones, compatibilidad Next.js |
| DB | PostgreSQL | Relacional, concurrente, persistente |
| Pagos | Adaptador intercambiable | Manual primero; pasarela activable sin refactorizar |
| Archivos | Cloudinary / S3 | Comprobantes, fotos de productos, creatividades IA |
| Calendar | Google Calendar API + Service Account | Sin depender del OAuth del usuario |
| IA | Gemini (Google AI Studio) | Gemini Pro disponible, sin costo adicional de API |
| WhatsApp | wa.me links prellenados | Conversación humana preservada; WA API si escala |

## Variables de entorno

Ver `.env.example` para la lista completa. Nunca exponer al cliente variables que contengan claves privadas.
