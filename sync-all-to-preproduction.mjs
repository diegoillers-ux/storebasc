import { execSync } from 'child_process';

const envVars = {
  NEXT_PUBLIC_DEMO_MODE: 'false',
  NEXT_PUBLIC_PAYMENT_PROVIDER: 'mercadopago',
  NEXT_PUBLIC_APP_NAME: 'Espíritu Ananda',
  NEXT_PUBLIC_APP_URL: 'https://storebasc.vercel.app',
  NEXT_PUBLIC_SUPABASE_URL: 'https://xsfadqsmsizdmlzvylny.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_Rt9L62cEGpmFrLbUmuD7bw_H7j--Vat',
  SUPABASE_SERVICE_ROLE_KEY: 'sb_publishable_Rt9L62cEGpmFrLbUmuD7bw_H7j--Vat',
  MERCADOPAGO_ACCESS_TOKEN: 'TEST-861063953111930-080818-3d1f40d61894daff63269c9ff2a4a65e-203682586',
  MERCADOPAGO_PUBLIC_KEY: 'TEST-d7029439-0334-4bca-a497-357a1c655524',
  NEXT_PUBLIC_WHATSAPP_NUMBER: '573159471170',
  NEXTAUTH_URL: 'https://storebasc.vercel.app',
  NEXTAUTH_SECRET: 'ananda_store_v2_super_secret_jwt_key_2026_production',
  AUTH_TRUST_HOST: 'true',
  GOOGLE_CLIENT_ID: '930363408123-nivqf5itq1u30ndv4frujj3v68hvb1kq.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: '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',
  ADMIN_EMAILS: 'diegoillers@gmail.com,diegoillers.ux@gmail.com,lina@espiritananda.com',
  NEXT_PUBLIC_CALENDAR_ID: 'diegoillers@gmail.com',
  CRON_SECRET: 'secreto_seguro_para_invocar_cron_cleanup',
  NEXT_PUBLIC_NEQUI_NUMBER: '300 123 4567',
  NEXT_PUBLIC_DAVIPLATA_NUMBER: '300 123 4567',
  NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT: 'Ahorros 123-456789-00',
};

const environments = ['production', 'preview', 'development'];

console.log('1. Limpiando y actualizando CRON_SECRET en Vercel...');
for (const env of environments) {
  try {
    execSync(`echo no | npx vercel env rm CRON_SECRET ${env} --yes`, { stdio: 'pipe' });
    execSync(`echo no | npx vercel env add CRON_SECRET ${env} --value "secreto_seguro_para_invocar_cron_cleanup" --yes`, { stdio: 'pipe' });
    console.log(`✓ CRON_SECRET reacondicionado en ${env}`);
  } catch (e) {
    console.log(`✕ CRON_SECRET retry (${env}):`, e.message);
  }
}

console.log('\n2. Desplegando el proyecto a Vercel (https://storebasc.vercel.app)...');
try {
  const output = execSync('npx vercel --prod --yes', { encoding: 'utf-8' });
  console.log('Output de despliegue:');
  console.log(output);
} catch (e) {
  console.error('Error durante el despliegue:', e.message);
}

console.log('\n¡Despliegue final a Vercel completado!');
