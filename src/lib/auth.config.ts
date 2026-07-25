import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '930363408123-nivqf5itq1u30ndv4frujj3v68hvb1kq.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
    }),
    Credentials({
      id: 'demo',
      name: 'Acceso Demo Admin',
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
