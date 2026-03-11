import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// AQUI ES DONDE PEGARAS TUS CLAVES MAS ADELANTE
// Reemplaza los valores con los que te de Google Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "Pega-aqui-tu-apiKey",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "Pega-aqui-tu-authDomain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Pega-aqui-tu-projectId",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "Pega-aqui-tu-storageBucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "Pega-aqui-tu-messagingSenderId",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "Pega-aqui-tu-appId"
};

// Evitamos inicializar Firebase dos veces en Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Conectamos a la base de datos (Firestore)
export const db = getFirestore(app);
