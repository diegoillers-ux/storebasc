import { execSync } from 'child_process';

const preprodVars = {
  NEXT_PUBLIC_DEMO_MODE: 'true',
  NEXT_PUBLIC_PAYMENT_PROVIDER: 'mercadopago',
  NEXT_PUBLIC_APP_NAME: 'Espíritu Ananda (Preproducción)',
  NEXT_PUBLIC_WHATSAPP_NUMBER: '573000000000',
  NEXTAUTH_SECRET: 'qa_secret_key_anandastore_v2_32_chars_long!',
  GOOGLE_CLIENT_ID: '930363408123-05bme833pree1fb5906pseqna66s1ug6.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: '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',
  ADMIN_EMAILS: 'diegoillers@gmail.com,diegoillers.ux@gmail.com,lina@espiritananda.com',
  NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyDbWEP9ghJQuy4Cjnca7rDUd7jG0G38P1w',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'nexo-celestial-final.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'nexo-celestial-final',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'nexo-celestial-final.firebasestorage.app',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '930363408123',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:930363408123:web:b125bdcfc74a42dd25fa5e',
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'G-2WXE21ECXK',
  NEXT_PUBLIC_CALENDAR_ID: 'diegoillers@gmail.com',
  CRON_SECRET: 'secreto_seguro_para_invocar_cron_cleanup',
  NEXT_PUBLIC_NEQUI_NUMBER: '300 123 4567',
  NEXT_PUBLIC_DAVIPLATA_NUMBER: '300 123 4567',
  NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT: 'Ahorros 123-456789-00',
};

const productionVarsToRemove = [
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'GOOGLE_CLIENT_EMAIL',
  'NEXTAUTH_SECRET',
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
  'ADMIN_EMAILS',
  'NEXTAUTH_URL',
  'GOOGLE_PRIVATE_KEY',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_CALENDAR_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'NEXT_PUBLIC_DEMO_MODE',
  'DEMO_MODE',
  'CRON_SECRET',
];

console.log('1. Eliminando variables del entorno de PRODUCCIÓN en Vercel...');

for (const key of productionVarsToRemove) {
  try {
    console.log(`Removiendo ${key} de production...`);
    execSync(`npx vercel env rm ${key} production --yes`, { stdio: 'pipe' });
    console.log(`✓ ${key} removido de production.`);
  } catch (e) {
    console.log(`- ${key} no existía o ya fue removido de production.`);
  }
}

console.log('\n2. Configurando variables exclusivamente para PREPRODUCCIÓN (Preview y Development)...');

for (const [key, value] of Object.entries(preprodVars)) {
  try {
    console.log(`Configurando ${key} en Preview...`);
    execSync(`echo no | npx vercel env add ${key} preview --value "${value}" --yes --force`, { stdio: 'pipe' });
    execSync(`echo no | npx vercel env add ${key} development --value "${value}" --yes --force`, { stdio: 'pipe' });
    console.log(`✓ ${key} configurado en Preview & Development.`);
  } catch (e) {
    console.log(`✕ Error configurando ${key}:`, e.message);
  }
}

console.log('\n3. Creando despliegue de PREPRODUCCIÓN (Preview Deployment)...');
try {
  const previewOutput = execSync('npx vercel --yes', { encoding: 'utf-8' });
  console.log('Output de despliegue Preview:');
  console.log(previewOutput);
} catch (e) {
  console.error('Error lanzando despliegue Preview:', e.message);
}

console.log('\n¡Proceso de Preproducción completado!');
