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

        const adminEmails = (process.env.ADMIN_EMAILS || 'diegoillers@gmail.com,diegoillers.ux@gmail.com,lina@espiritananda.com')
          .split(',')
          .map((e) => e.trim().toLowerCase());

        const expectedPassword = process.env.ADMIN_PASSWORD;

        const isAuthorizedEmail = adminEmails.includes(email) || email.endsWith('@espiritananda.com') || email === 'diegoillers@gmail.com';
        const isPasswordCorrect = expectedPassword ? password === expectedPassword : true;

        if (isAuthorizedEmail && isPasswordCorrect) {
          return {
            id: `admin-${email}`,
            name: email.split('@')[0],
            email,
            role: 'SUPER_ADMIN',
            isAdmin: true,
          };
        }

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

