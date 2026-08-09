import { execSync } from 'child_process';

const preprodVars = {
  NEXT_PUBLIC_DEMO_MODE: 'true',
  NEXT_PUBLIC_PAYMENT_PROVIDER: 'mercadopago',
  NEXT_PUBLIC_APP_NAME: 'Espíritu Ananda (Preproducción)',
  NEXT_PUBLIC_WHATSAPP_NUMBER: '573000000000',
  NEXTAUTH_SECRET: 'qa_secret_key_anandastore_v2_32_chars_long!',
  AUTH_TRUST_HOST: 'true',
  GOOGLE_CLIENT_ID: '930363408123-nivqf5itq1u30ndv4frujj3v68hvb1kq.apps.googleusercontent.com',
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

const environments = ['preview', 'development', 'production'];

console.log('1. Cargando variables en el proyecto nuevo y limpio de Vercel...');

for (const [key, value] of Object.entries(preprodVars)) {
  for (const env of environments) {
    try {
      execSync(`echo no | npx vercel env add ${key} ${env} --value "${value}" --yes --force`, { stdio: 'pipe' });
      console.log(`✓ ${key} configurado en ${env}`);
    } catch (e) {
      console.log(`✕ Error en ${key} (${env}):`, e.message);
    }
  }
}

console.log('\n2. Desplegando el primer build limpio de Preproducción...');
try {
  const output = execSync('npx vercel --yes', { encoding: 'utf-8' });
  console.log('Output de despliegue Preview:');
  console.log(output);
} catch (e) {
  console.error('Error lanzando despliegue:', e.message);
}

console.log('\n¡Proyecto limpio configurado en Vercel!');
