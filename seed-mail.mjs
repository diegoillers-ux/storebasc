import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('apiKey')) {
  console.error('Error: Faltan variables de entorno de Firebase para ejecutar el sembrado de plantillas de correo.');
  console.error('Asegúrate de tener un archivo .env configurado y ejecutar el script con:');
  console.error('  node --env-file=.env seed-mail.mjs');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const templates = [
  {
    id: 'reserva_pendiente',
    subject: 'Reserva pendiente de pago - {servicio}',
    body: `
<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #efe9e5; padding: 20px; border-radius: 10px;">
  <h2 style="color: #d4af37; text-align: center;">Hola {cliente}</h2>
  <p>Gracias por reservar tu sesión de <strong>{servicio}</strong>.</p>
  <p>Hemos separado tu cupo para el <strong>{fecha}</strong>.</p>
  <div style="background-color: #fcfbf9; padding: 15px; border-left: 4px solid #d4af37; margin: 20px 0;">
    <p style="margin: 0; font-weight: bold;">Importante:</p>
    <p style="margin: 5px 0 0 0;">Este es un bloqueo temporal. Tienes <strong>30 minutos</strong> para realizar la transferencia y reportar el pago. Si no, el sistema liberará la hora automáticamente.</p>
  </div>
  <p>Si ya realizaste el pago, adjunta el comprobante desde el enlace de confirmación.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
  <p style="font-size: 0.8em; color: #888; text-align: center;">Saludos,<br/>El Nexo Celestial</p>
</div>
        `.trim(),
  },
  {
    id: 'pago_confirmado',
    subject: 'Pago validado - {servicio} confirmado',
    body: `
<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #efe9e5; padding: 20px; border-radius: 10px;">
  <h2 style="color: #48bb78; text-align: center;">¡Tu pago ha sido consagrado!</h2>
  <p>Hola {cliente},</p>
  <p>Hemos verificado tu transferencia. Tu sesión de <strong>{servicio}</strong> para el <strong>{fecha}</strong> ha sido confirmada en el calendario astral.</p>
  <p>Pronto recibirás los detalles finales para nuestro encuentro.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
  <p style="font-size: 0.8em; color: #888; text-align: center;">Bendiciones,<br/>El Nexo Celestial</p>
</div>
        `.trim(),
  },
  {
    id: 'rifa_reservada',
    subject: 'Tu número de la suerte ha sido reservado - {servicio}',
    body: `
<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #efe9e5; padding: 20px; border-radius: 10px;">
  <h2 style="color: #d4af37; text-align: center;">Número Reservado</h2>
  <p>Hola {cliente},</p>
  <p>Has seleccionado el número <strong>{numero}</strong> para el sorteo <strong>{servicio}</strong>.</p>
  <p>Monto a transferir: <strong>{monto}</strong>.</p>
  <p>Una vez verifiquemos tu comprobante, este número será oficialmente tuyo en el mapa estelar.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
  <p style="font-size: 0.8em; color: #888; text-align: center;">¡Mucha suerte!<br/>El Nexo Celestial</p>
</div>
        `.trim(),
  },
];

async function seedTemplates() {
  console.log('Sembrando plantillas de mensajería en Firebase...');
  for (const t of templates) {
    await setDoc(doc(db, 'mail_templates', t.id), {
      subject: t.subject,
      body: t.body,
      updatedAt: new Date().toISOString(),
    });
    console.log(`Plantilla ${t.id} creada.`);
  }
  console.log('¡Siembra completada!');
  process.exit(0);
}

seedTemplates().catch(console.error);