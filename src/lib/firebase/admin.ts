import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (typeof window !== 'undefined') {
  throw new Error('Firebase Admin SDK cannot be used on the client side.');
}

let dbInstance: ReturnType<typeof getFirestore> | null = null;

export function getAdminDb() {
  if (dbInstance) return dbInstance;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    // Retornar un mock o lanzar un error tardío sólo si se intenta ejecutar una query.
    // Esto previene que Next.js falle al importar el archivo durante la compilación estática.
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not defined.');
  }

  try {
    const certConfig = JSON.parse(serviceAccountKey);
    // Normalizar los saltos de línea de la clave privada de Google
    if (certConfig.private_key) {
      certConfig.private_key = certConfig.private_key.replace(/\\n/g, '\n');
    }
    const app = getApps().length === 0 
      ? initializeApp({ credential: cert(certConfig) }) 
      : getApp();
    
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

export { FieldValue, Timestamp } from 'firebase-admin/firestore';
