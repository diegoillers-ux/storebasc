import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminSupabaseInstance: SupabaseClient | null = null;

export function getAdminSupabase(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('Admin Supabase Client cannot be used on the client side.');
  }

  if (adminSupabaseInstance) {
    return adminSupabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // Retornamos un cliente dummy si estamos en build o modo demo sin credenciales configuradas
    adminSupabaseInstance = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      serviceRoleKey || 'placeholder-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
    return adminSupabaseInstance;
  }

  adminSupabaseInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminSupabaseInstance;
}
