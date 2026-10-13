import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  console.error('Ejecuta el script con: node --env-file=.env.local seed-supabase.mjs');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const services = [
  { id: 'lectura-carta-natal', name: 'Carta Natal Holística', slug: 'lectura-carta-natal', duration: 60, price: 116000, active: true, category: 'astrologia', description: 'Lectura completa de la carta astral con análisis natal y transitos actuales.' },
  { id: 'revolucion-solar', name: 'Revolución Solar', slug: 'revolucion-solar', duration: 60, price: 116000, active: true, category: 'astrologia', description: 'Pronóstico anual desde el cumpleaños actual hasta el siguiente ciclo solar.' },
  { id: 'sinastria-pareja', name: 'Sinastría de Pareja', slug: 'sinastria-pareja', duration: 75, price: 150000, active: true, category: 'astrologia', description: 'Compatibilidad astrológica y dinámica relacional entre dos personas.' },
  { id: 'lectura-tarot-evolutivo', name: 'Tarot Evolutivo', slug: 'lectura-tarot-evolutivo', duration: 45, price: 85000, active: true, category: 'tarot', description: 'Sesión intuitiva de tarot para orientación en toma de decisiones.' },
];

const products = [
  { id: 'kit-sahumado-sagrado', name: 'Kit de Sahumado Sagrado', slug: 'kit-sahumado-sagrado', price: 65000, stock: 15, active: true, category: 'rituales', description: 'Sahumerio de salvia blanca, palo santo y atado de cuarzos.' },
  { id: 'vela-intencionada-abundancia', name: 'Vela Intencionada Abundancia', slug: 'vela-intencionada-abundancia', price: 45000, stock: 20, active: true, category: 'velas', description: 'Vela artesanal de cera de soya infusionada con pirita y aceites esenciales.' },
  { id: 'set-cuarzos-7-chakras', name: 'Set de Cuarzos 7 Chakras', slug: 'set-cuarzos-7-chakras', price: 55000, stock: 10, active: true, category: 'cristales', description: 'Cristales naturales pulidos para alineación energética.' },
];

const adminUsers = [
  { email: 'diegoillers@gmail.com', name: 'Diego Illeras (Soporte)', role: 'SUPER_ADMIN', active: true },
  { email: 'diegoillers.ux@gmail.com', name: 'Diego UX (Soporte)', role: 'SUPER_ADMIN', active: true },
  { email: 'lina@espiritananda.com', name: 'Lina Espíritu Ananda', role: 'ADMIN', active: true },
];

async function seed() {
  console.log('🌱 Sembrando base de datos Supabase PostgreSQL...');

  const { error: sErr } = await supabase.from('services').upsert(services);
  if (sErr) console.error('Error al insertar servicios:', sErr.message);
  else console.log('✅ Servicios astrales sembrados correctamente.');

  const { error: pErr } = await supabase.from('products').upsert(products);
  if (pErr) console.error('Error al insertar productos:', pErr.message);
  else console.log('✅ Productos holísticos sembrados correctamente.');

  const { error: uErr } = await supabase.from('admin_users').upsert(adminUsers, { onConflict: 'email' });
  if (uErr) console.error('Error al insertar administradores:', uErr.message);
  else console.log('✅ Administradores y roles configurados.');

  const { error: aErr } = await supabase.from('availability_settings').upsert({
    id: 'default',
    work_days: [1, 2, 3, 4, 5, 6],
    time_slots: ['09:00', '10:30', '14:00', '15:30', '17:00'],
  });
  if (aErr) console.error('Error al configurar agenda:', aErr.message);
  else console.log('✅ Reglas de disponibilidad y agenda inicializadas.');

  console.log('🚀 ¡Sembrado en Supabase completado con éxito!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error fatal durante el sembrado:', err);
  process.exit(1);
});
