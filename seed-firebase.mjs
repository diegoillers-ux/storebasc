import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('apiKey')) {
  console.error('Error: Faltan variables de entorno de Firebase para ejecutar el sembrado.');
  console.error('Asegúrate de tener un archivo .env configurado y ejecutar el script con:');
  console.error('  node --env-file=.env seed-firebase.mjs');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const raffles = [
  {
    id: 'rifa-luna-llena',
    title: 'Sorteo Luna Llena',
    description: 'Participa por una lectura completa de Tarot + Kit de purificación. Juega con los dos últimos dígitos de la Lotería de Bogotá.',
    price: '$15.000 COP',
    priceNumber: 15000,
    totalNumbers: 100, // 00 to 99
    soldNumbers: [13, 7, 21, 69, 44, 99], // Mock de números vendidos
    active: true,
  },
  {
    id: 'rifa-astral',
    title: 'Sorteo Astral Anual',
    description: 'Gana un amuleto consagrado y carta astral personalizada. Juega con los tres últimos dígitos de la Lotería de Medellín.',
    price: '$25.000 COP',
    priceNumber: 25000,
    totalNumbers: 1000,
    soldNumbers: [111, 222, 333, 777],
    active: true,
  },
];

async function seed() {
  console.log('Empezando a subir rifas a Firebase...');
  for (const raffle of raffles) {
    const raffleRef = doc(db, 'raffles', raffle.id);
    await setDoc(raffleRef, raffle);
    console.log(`Rifa "${raffle.title}" guardada exitosamente.`);
  }
  console.log('¡Proceso completado!');
  process.exit(0);
}

seed().catch(console.error);