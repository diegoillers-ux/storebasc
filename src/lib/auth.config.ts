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

        if (!inputIdentifier || !password || password.length < 6) return null;

        const { getAdminSupabase } = await import('@/lib/supabase/server');
        const supabase = getAdminSupabase();

        // 1. Resolver email: si el identificador es una cédula, buscar el correo del cliente
        let loginEmail = inputIdentifier.includes('@') ? inputIdentifier : '';

        if (!loginEmail) {
          try {
            const { customerRepository } = await import('@/lib/supabase/repositories/customers');
            const customer = await customerRepository.getByCedula(inputIdentifier);
            if (customer?.email) loginEmail = customer.email.toLowerCase();
          } catch (cedErr) {
            console.log('[Auth] Nota búsqueda cédula:', cedErr);
          }
        }

        if (!loginEmail) return null;

        // 2. Verificar contraseña contra Supabase Auth (única fuente de contraseñas)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });
        if (error || !data?.user) return null;

        const verifiedEmail = data.user.email?.toLowerCase() || loginEmail;

        // 3. Determinar rol por prioridad: admin_users → ADMIN_EMAILS → customers
        try {
          const { adminUserRepository } = await import('@/lib/supabase/repositories/admin-users');
          const dbAdmin = await adminUserRepository.getByEmail(verifiedEmail);
          if (dbAdmin && dbAdmin.active) {
            return {
              id: dbAdmin.id || `admin-${verifiedEmail}`,
              name: dbAdmin.name || verifiedEmail.split('@')[0],
              email: verifiedEmail,
              role: dbAdmin.role || 'SUPER_ADMIN',
              isAdmin: true,
            };
          }
        } catch (dbErr) {
          console.log('[Auth] Nota búsqueda admin_users:', dbErr);
        }

        const adminEmails = (process.env.ADMIN_EMAILS || '')
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);

        if (adminEmails.includes(verifiedEmail)) {
          return {
            id: `admin-${verifiedEmail}`,
            name: verifiedEmail.split('@')[0],
            email: verifiedEmail,
            role: 'SUPER_ADMIN',
            isAdmin: true,
          };
        }

        try {
          const { customerRepository } = await import('@/lib/supabase/repositories/customers');
          const customers = await customerRepository.getByEmail(verifiedEmail);
          if (customers.length > 0 && customers[0].active) {
            return {
              id: customers[0].id || `client-${verifiedEmail}`,
              name: customers[0].name,
              email: verifiedEmail,
              role: 'CLIENT' as const,
              isAdmin: false,
            };
          }
        } catch (custErr) {
          console.log('[Auth] Nota búsqueda customers:', custErr);
        }

        // Registrado en Auth sin perfil: sesión de cliente genérica
        return {
          id: `user-${verifiedEmail}`,
          name: data.user.user_metadata?.name || verifiedEmail.split('@')[0],
          email: verifiedEmail,
          role: 'CLIENT' as const,
          isAdmin: false,
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
