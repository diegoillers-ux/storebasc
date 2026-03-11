# Codebasicstor

Proyecto web para reserva de servicios con panel admin, integracion Google Calendar y envio de correos.

## Documentacion de entrega
- Tecnico: `docs/01-ENTREGABLE-TECNICO.md`
- Manual de configuracion: `docs/02-MANUAL-CONFIGURACION.md`
- Flyer comercial: `docs/03-FLYER-COMERCIAL.md`
- Hoja de ruta de escalado: `docs/04-HOJA-RUTA-ESCALADO.md`

## Ejecucion local
```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Inicio de sesion admin
- El CRM usa Google Login con NextAuth.
- La pantalla de acceso queda en `/login` y el panel en `/admin/reservas`.
- Solo entran correos definidos en `ADMIN_EMAILS`, separados por comas.

### Variables minimas para login
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `ADMIN_EMAILS`

### Configuracion en Google Cloud
1. Crear un proyecto o reutilizar uno existente.
2. Configurar la pantalla de consentimiento OAuth.
3. Crear credenciales OAuth 2.0 tipo `Aplicacion web`.
4. Agregar como `Authorized JavaScript origins`:
	- `http://localhost:3000`
	- Tu dominio productivo, por ejemplo `https://tu-dominio.com`
5. Agregar como `Authorized redirect URIs`:
	- `http://localhost:3000/api/auth/callback/google`
	- `https://tu-dominio.com/api/auth/callback/google`

### Recomendacion operativa
- Produccion: `NEXT_PUBLIC_DEMO_MODE=false` y acceso solo por Google.
- Demo o presentacion: activar `NEXT_PUBLIC_DEMO_MODE=true` solo si necesitas enseñar el panel sin login real.
