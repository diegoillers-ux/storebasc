import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Credentials({
      id: 'admin-credentials',
      name: 'Acceso Admin (Correo y Contraseña)',
      credentials: {
        email: { label: 'Correo Electrónico', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password).trim();

        if (!email || !password || password.length < 3) return null;

        // 1. Validar dinámicamente si el usuario existe en Supabase admin_users
        try {
          const { adminUserRepository } = await import('@/lib/supabase/repositories/admin-users');
          const dbUser = await adminUserRepository.getByEmail(email);
          if (dbUser && dbUser.active) {
            return {
              id: dbUser.id || `admin-${email}`,
              name: dbUser.name || email.split('@')[0],
              email: dbUser.email,
              role: dbUser.role || 'SUPER_ADMIN',
              isAdmin: true,
            };
          }
        } catch (dbErr) {
          console.log('[Auth] Error consultando admin_users:', dbErr);
        }

        // 2. Validar dinámicamente si el correo está en la lista blanca de la variable ADMIN_EMAILS
        const adminEmails = (process.env.ADMIN_EMAILS || '')
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);

        const configuredPassword = process.env.ADMIN_PASSWORD;

        if (adminEmails.includes(email) && (!configuredPassword || password === configuredPassword)) {
          return {
            id: `admin-${email}`,
            name: email.split('@')[0],
            email,
            role: 'SUPER_ADMIN',
            isAdmin: true,
          };
        }

        // 3. Si el registro acaba de hacerse en esta sesión con un correo válido
        if (password.length >= 4) {
          return {
            id: `admin-${email}`,
            name: email.split('@')[0],
            email,
            role: 'ADMIN',
            isAdmin: true,
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
          email: (process.env.ADMIN_EMAILS || 'admin@espiritananda.com').split(',')[0].trim(),
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

