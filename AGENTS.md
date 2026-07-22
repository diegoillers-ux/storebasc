# CONTEXTO DEL PROYECTO (AnandaStore V2)

- **Repositorio**: `diegoillers-ux/storebasc`, rama: `redesign/ananda-v2`
- **Stack**: Next.js (App Router), TypeScript, Tailwind CSS v4 (vía PostCSS), Firebase Firestore (Admin SDK en server, Client SDK en browser)
- **Design Tokens** (en `src/app/globals.css`): Paleta `--color-ananda-*`, fuente `--font-display` (Playfair Display), `--font-sans` (Inter), clases `.glass-card`, `.glass-effect`, `--shadow-premium`
- **Colores Clave**: `ananda-950` (`#1A0F3D`), `ananda-900` (`#2D1B69`), `ananda-500` (`#7C3AED`), `ananda-400` (`#A78BFA`), `ananda-50` (`#FAF5FF`)
- **Repositorios Firebase Disponibles** (en `src/lib/firebase/repositories/`): `services.ts`, `products.ts`, `bookings.ts`, `payments.ts`, `customers.ts`, `availability.ts`
- **Helpers Disponibles**: `src/lib/whatsapp.ts` (`getGeneralContactLink`, `getServiceBookingLink`), `src/lib/payments/index.ts` + `wompi.ts` + `manual.ts`
- **Layout Público**: `src/app/(public)/layout.tsx` con `PublicHeader` y `PublicFooter` en `src/components/public/`
- **Modo Demo**: `src/lib/demoMode.ts` — si `isDemoMode()` retorna mock data, en producción usa Firestore real
- **REGLAS DE ORO**: NO usar Prisma ni PostgreSQL. NO crear rutas protegidas con NextAuth para el flujo público.
