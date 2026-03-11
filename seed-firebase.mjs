import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD9-SqcgPLyjOnbMpw31K3Lgq08F3qUTvM",
  authDomain: "conductorpro-2fa86.firebaseapp.com",
  projectId: "conductorpro-2fa86",
  storageBucket: "conductorpro-2fa86.firebasestorage.app",
  messagingSenderId: "1090910090310",
  appId: "1:1090910090310:web:f40904ea6fe9092f78c647",
  measurementId: "G-3ETY2VG08X"
};

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
        active: true
    },
    {
        id: 'rifa-astral',
        title: 'Sorteo Astral Anual',
        description: 'Gana un amuleto consagrado y carta astral personalizada. Juega con los tres últimos dígitos de la Lotería de Medellín.',
        price: '$25.000 COP',
        priceNumber: 25000,
        totalNumbers: 1000,
        soldNumbers: [111, 222, 333, 777],
        active: true
    }
];

async function seed() {
    console.log('Empezando a subir rifas a Firebase...');
    for (const raffle of raffles) {
        const raffleRef = doc(db, 'raffles', raffle.id);
        await setDoc(raffleRef, raffle);
        console.log(`Rifa ${raffle.title} guardada exitosamente.`);
    }
    console.log('¡Proceso completado!');
    process.exit(0);
}

seed().catch(console.error);