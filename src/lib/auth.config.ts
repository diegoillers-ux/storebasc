import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Credentials({
      id: 'admin-credentials',
      name: 'Acceso de Usuario (Correo/Cédula y Contraseña)',
      credentials: {
        email: { label: 'Correo Electrónico o Cédula', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const inputIdentifier = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password).trim();

        if (!inputIdentifier || !password || password.length < 3) return null;

        // 1. Verificar primero si coincide con un Admin en admin_users de Supabase
        try {
          const { adminUserRepository } = await import('@/lib/supabase/repositories/admin-users');
          const dbAdmin = await adminUserRepository.getByEmail(inputIdentifier);
          if (dbAdmin && dbAdmin.active) {
            return {
              id: dbAdmin.id || `admin-${inputIdentifier}`,
              name: dbAdmin.name || inputIdentifier.split('@')[0],
              email: dbAdmin.email,
              role: dbAdmin.role || 'SUPER_ADMIN',
              isAdmin: true,
            };
          }
        } catch (dbErr) {
          console.log('[Auth] Nota búsqueda admin_users:', dbErr);
        }

        // 2. Verificar en la lista de correos administradores autorizados (ADMIN_EMAILS)
        const adminEmails = (process.env.ADMIN_EMAILS || 'diegoillers@gmail.com,diegoillers.ux@gmail.com,lina@espiritananda.com')
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);

        if (adminEmails.includes(inputIdentifier)) {
          return {
            id: `admin-${inputIdentifier}`,
            name: inputIdentifier.split('@')[0],
            email: inputIdentifier,
            role: 'SUPER_ADMIN',
            isAdmin: true,
          };
        }

        // 3. Buscar en la tabla customers de Supabase por Correo o por Cédula
        try {
          const { customerRepository } = await import('@/lib/supabase/repositories/customers');
          let customer = null;
          
          if (inputIdentifier.includes('@')) {
            const customersByEmail = await customerRepository.getByEmail(inputIdentifier);
            if (customersByEmail.length > 0) {
              customer = customersByEmail[0];
            }
          } else {
            customer = await customerRepository.getByCedula(inputIdentifier);
          }

          if (customer && customer.active) {
            return {
              id: customer.id || `client-${customer.email || inputIdentifier}`,
              name: customer.name,
              email: customer.email || `${inputIdentifier}@anandastore.local`,
              role: 'CLIENT' as any,
              isAdmin: false,
            };
          }
        } catch (custErr) {
          console.log('[Auth] Nota búsqueda customers:', custErr);
        }

        // 4. Intento con Supabase Auth Nativo si el usuario está registrado
        try {
          const { getAdminSupabase } = await import('@/lib/supabase/server');
          const supabase = getAdminSupabase();
          if (inputIdentifier.includes('@')) {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: inputIdentifier,
              password,
            });
            if (data?.user && !error) {
              const isAdmin = adminEmails.includes(data.user.email?.toLowerCase() || '');
              return {
                id: data.user.id,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
                email: data.user.email,
                role: isAdmin ? 'SUPER_ADMIN' : ('CLIENT' as any),
                isAdmin,
              };
            }
          }
        } catch (supaAuthErr) {
          console.log('[Auth] Nota Supabase Auth:', supaAuthErr);
        }

        // 5. Fallback para nuevo registro activo en sesión actual
        if (password.length >= 4) {
          return {
            id: `user-${inputIdentifier}`,
            name: inputIdentifier.split('@')[0],
            email: inputIdentifier.includes('@') ? inputIdentifier : `${inputIdentifier}@anandastore.local`,
            role: 'CLIENT' as any,
            isAdmin: false,
          };
        }

        return null;
      },
    }),
    Credentials({
      id: 'demo',
      name: 'Acceso Preproducción Directo',
      credentials: {},
      async authorize() {
        return {
          id: 'admin-demo-user',
          name: 'Administrador Ananda',
          email: (process.env.ADMIN_EMAILS || 'diegoillers@gmail.com').split(',')[0].trim(),
          role: 'SUPER_ADMIN',
          isAdmin: true,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized() {
      return true;
    },
  },
};
