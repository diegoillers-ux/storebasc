import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminSupabaseInstance: SupabaseClient | null = null;

export function getAdminSupabase(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('Admin Supabase Client cannot be used on the client side.');
  }

  if (adminSupabaseInstance) {
    return adminSupabaseInstance;
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!rawUrl || !rawKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en variables de entorno del servidor.');
  }

  const supabaseUrl = (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
    ? rawUrl
    : 'https://placeholder.supabase.co';
  const serviceRoleKey = rawKey;

  adminSupabaseInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminSupabaseInstance;
}
