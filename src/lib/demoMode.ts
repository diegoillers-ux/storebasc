export function isDemoMode() {
  if (
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    process.env.DEMO_MODE === 'true' ||
    process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'
  ) {
    return true;
  }
  // Fallback automático a modo demo si no están configuradas las credenciales de Supabase en el servidor
  if (typeof window === 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    return true;
  }
  return false;
}
