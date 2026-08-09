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
  MERCADOPAGO_WEBHOOK_SECRET: '',
  NEXT_PUBLIC_WHATSAPP_NUMBER: '573159471170',
  NEXTAUTH_URL: 'https://storebasc.vercel.app',
  NEXTAUTH_SECRET: 'ananda_store_v2_super_secret_jwt_key_2026_production',
  AUTH_TRUST_HOST: 'true',
  ADMIN_EMAILS: 'diegoillers@gmail.com,diegoillers.ux@gmail.com,lina@espiritananda.com',
  NEXT_PUBLIC_CALENDAR_ID: 'diegoillers@gmail.com',
  CRON_SECRET: 'secreto_seguro_para_invocar_cron_cleanup',
  NEXT_PUBLIC_NEQUI_NUMBER: '300 123 4567',
  NEXT_PUBLIC_DAVIPLATA_NUMBER: '300 123 4567',
  NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT: 'Ahorros 123-456789-00',
};

const obsoleteVars = [
  'NEXT_PUBLIC_PAYMENT_MODE',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'DEMO_MODE',
];

const environments = ['production', 'preview', 'development'];

console.log('1. Limpiando variables obsoletas en Vercel...');
for (const key of obsoleteVars) {
  for (const env of environments) {
    try {
      execSync(`echo no | npx vercel env rm ${key} ${env} --yes`, { stdio: 'pipe' });
      console.log(`✓ Eliminada variable obsoleta ${key} de ${env}`);
    } catch {
      // Variable didn't exist or was already removed
    }
  }
}

console.log('\n2. Sincronizando variables oficiales V2 en Vercel...');
for (const [key, value] of Object.entries(envVars)) {
  for (const env of environments) {
    try {
      execSync(`echo no | npx vercel env rm ${key} ${env} --yes`, { stdio: 'pipe' });
    } catch {}
    try {
      execSync(`echo no | npx vercel env add ${key} ${env} --value "${value}" --yes`, { stdio: 'pipe' });
      console.log(`✓ Variable ${key} configurada en ${env}`);
    } catch (e) {
      console.error(`✕ Error en ${key} (${env}):`, e.message);
    }
  }
}

console.log('\n3. Realizando despliegue limpio de Producción/Preproducción en Vercel...');
try {
  const output = execSync('npx vercel --prod --yes', { encoding: 'utf-8' });
  console.log('Output de despliegue Vercel:');
  console.log(output);
} catch (e) {
  console.error('Error durante el despliegue:', e.message);
}

console.log('\n¡Limpieza, sincronización y despliegue completados exitosamente!');

