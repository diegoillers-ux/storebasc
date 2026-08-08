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

        const adminEmails = (process.env.ADMIN_EMAILS || 'diegoillers@gmail.com,diegoillers.ux@gmail.com,lina@espiritananda.com')
          .split(',')
          .map((e) => e.trim().toLowerCase());

        const expectedPassword = process.env.ADMIN_PASSWORD || 'ananda2026!';

        if (adminEmails.includes(email) && password === expectedPassword) {
          return {
            id: `admin-${email}`,
            name: email.split('@')[0],
            email,
            role: 'SUPER_ADMIN',
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
          name: 'Diego Illeras (Admin)',
          email: 'diegoillers@gmail.com',
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

