import { execSync } from 'child_process';

const requiredEnvKeys = [
    'DEMO_MODE',
    'NEXT_PUBLIC_DEMO_MODE',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
    'GMAIL_USER',
    'GMAIL_APP_PASSWORD',
    'ADMIN_EMAILS',
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'NEXT_PUBLIC_CALENDAR_ID',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
];

const envs = Object.fromEntries(requiredEnvKeys.map((key) => [key, process.env[key] || '']));
const missingKeys = requiredEnvKeys.filter((key) => !envs[key]);

if (missingKeys.length > 0) {
    console.error('Faltan variables requeridas antes de desplegar:');
    missingKeys.forEach((key) => console.error(`- ${key}`));
    process.exit(1);
}

console.log('Iniciando subida masiva de variables a Vercel...');

for (const [key, value] of Object.entries(envs)) {
    try {
        console.log(`Subiendo ${key}...`);
        // Usamos echo "no" para responder a la pregunta de cifrado de Vercel
        execSync(`echo no | vercel env add ${key} production "${value}"`, { stdio: 'inherit' });
    } catch {
        console.log(`Error o ya existe ${key}, continuando...`);
    }
}

console.log('Variables subidas. Lanzando despliegue de producción...');
execSync('vercel --prod --yes', { stdio: 'inherit' });
console.log('¡PROCESO COMPLETADO EXITOSAMENTE!');
