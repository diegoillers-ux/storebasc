import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const envPath = path.resolve('.env');
if (!fs.existsSync(envPath)) {
  console.error('No se encontró el archivo .env local.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

const envs = {};
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;

  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;

  const key = trimmed.substring(0, eqIdx).trim();
  let value = trimmed.substring(eqIdx + 1).trim();

  // Remover comillas si existen
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  } else if (value.startsWith("'") && value.endsWith("'")) {
    value = value.slice(1, -1);
  }

  envs[key] = value;
}

// Sobreescribir el bypass de autenticación para que el Login real de Google funcione en producción
envs['NEXT_PUBLIC_BYPASS_AUTH'] = 'false';

console.log('Variables a cargar detectadas en .env:', Object.keys(envs));
console.log('Iniciando carga limpia de variables de entorno a Vercel...');

for (const [key, value] of Object.entries(envs)) {
  if (!value) {
    console.log(`Clave ${key} vacía, omitiendo...`);
    continue;
  }
  
  try {
    console.log(`Actualizando ${key} en Vercel...`);
    // Usamos echo no para saltar diálogos y stdio pipe para evitar que se bloquee la entrada estándar
    execSync(`echo no | vercel env add ${key} production --value "${value}" --yes --force`, { stdio: 'pipe' });
    console.log(`✓ ${key} configurada.`);
  } catch (err) {
    console.error(`✕ Error al configurar ${key}:`, err.message);
  }
}

console.log('Variables cargadas con éxito. Iniciando despliegue de producción...');
execSync('vercel --prod --yes', { stdio: 'inherit' });
console.log('¡DESPLIEGUE FINAL REALIZADO CON ÉXITO EN VERCEL!');
