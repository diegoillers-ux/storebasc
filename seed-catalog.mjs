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
  console.error('Error: Faltan variables de entorno de Firebase para ejecutar el sembrado del catálogo.');
  console.error('Asegúrate de tener un archivo .env configurado y ejecutar el script con:');
  console.error('  node --env-file=.env seed-catalog.mjs');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const services = [
  { id: 'servicio-inicial', title: 'Servicio Inicial', description: 'Sesion introductoria para conocer el servicio y definir objetivos.', price: '$35.000 COP', priceNumber: 35000, icon: '*' },
  { id: 'servicio-express', title: 'Servicio Express', description: 'Atencion corta para consultas puntuales de clientes.', price: '$35.000 COP', priceNumber: 35000, icon: '+' },
  { id: 'servicio-completo', title: 'Servicio Completo', description: 'Sesion extendida con diagnostico y recomendaciones personalizadas.', price: '$116.000 COP', priceNumber: 116000, icon: '#' },
  { id: 'asesoria-especializada', title: 'Asesoria Especializada', description: 'Acompanamiento de una hora para casos con mayor profundidad.', price: '$85.000 COP', priceNumber: 85000, icon: '@' },
  { id: 'plan-personalizado', title: 'Plan Personalizado', description: 'Incluye asesoria y propuesta de plan de accion para seguimiento.', price: '$105.000 COP', priceNumber: 105000, icon: '%' },
  { id: 'sesion-premium', title: 'Sesion Premium', description: 'Sesion avanzada para clientes que requieren soporte integral.', price: '$116.000 COP', priceNumber: 116000, icon: '&' },
];

const products = [
  { id: 'producto-1', title: 'Producto Base 1', description: 'Producto de ejemplo editable para catalogo comercial.', price: '$65.000 COP', priceNumber: 65000, imagePlaceholder: 'P1' },
  { id: 'producto-2', title: 'Producto Base 2', description: 'Item de muestra para personalizar nombre, precio y descripcion.', price: '$45.000 COP', priceNumber: 45000, imagePlaceholder: 'P2' },
  { id: 'producto-3', title: 'Producto Base 3', description: 'Referencia de inventario lista para adaptar a tu negocio.', price: '$38.000 COP', priceNumber: 38000, imagePlaceholder: 'P3' },
  { id: 'producto-4', title: 'Producto Base 4', description: 'Producto de ejemplo orientado a ventas recurrentes.', price: '$75.000 COP', priceNumber: 75000, imagePlaceholder: 'P4' },
  { id: 'producto-5', title: 'Producto Base 5', description: 'Muestra final para completar un catalogo inicial de cinco items.', price: '$55.000 COP', priceNumber: 55000, imagePlaceholder: 'P5' },
];

async function seed() {
  console.log('Migrando Servicios y Productos a Firebase...');
  for (const s of services) { await setDoc(doc(db, 'services', s.id), s); }
  for (const p of products) { await setDoc(doc(db, 'products', p.id), p); }
  console.log('¡Migración exitosa!');
  process.exit(0);
}

seed().catch(console.error);