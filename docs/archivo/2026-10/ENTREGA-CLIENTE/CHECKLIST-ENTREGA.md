# CHECKLIST FINAL DE ENTREGA - CODEBASICSTOR

## 1) Archivos incluidos
- [ ] 01-ENTREGABLE-TECNICO.md
- [ ] 01-ENTREGABLE-TECNICO.pdf
- [ ] 02-MANUAL-CONFIGURACION.md
- [ ] 02-MANUAL-CONFIGURACION.pdf
- [ ] 03-FLYER-COMERCIAL.md
- [ ] 03-FLYER-COMERCIAL.pdf
- [ ] .env.example

## 2) Configuracion minima del cliente
- [ ] Proyecto creado en Google Cloud
- [ ] Google Calendar API activada
- [ ] Service Account creado y JSON descargado
- [ ] Calendario compartido con el bot (permiso para editar eventos)
- [ ] Calendar ID real configurado
- [ ] OAuth 2.0 Web App creado (Client ID y Client Secret)
- [ ] Redirect URI local y productiva configuradas
- [ ] Correo admin agregado en ADMIN_EMAILS
- [ ] Gmail con App Password configurado para envio

## 3) Variables obligatorias en despliegue
- [ ] NEXTAUTH_URL
- [ ] NEXTAUTH_SECRET
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] ADMIN_EMAILS
- [ ] GOOGLE_CLIENT_EMAIL
- [ ] GOOGLE_PRIVATE_KEY
- [ ] NEXT_PUBLIC_CALENDAR_ID
- [ ] GMAIL_USER
- [ ] GMAIL_APP_PASSWORD
- [ ] CRON_SECRET

## 4) Pruebas de aceptacion
- [ ] Home carga correctamente
- [ ] Login admin por Google funciona
- [ ] Se visualizan horarios disponibles
- [ ] Se crea reserva pendiente
- [ ] Admin aprueba reserva
- [ ] Enlace de sesion se guarda/envia
- [ ] Correo llega al cliente
- [ ] Cron cleanup protegido y operativo

## 5) Cierre de seguridad antes de entregar
- [ ] No hay .env.local en repo
- [ ] No hay JSON de service account en repo
- [ ] Repo privado
- [ ] Credenciales entregadas por canal seguro
- [ ] Rotacion de credenciales al cambiar de propietario
