import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { adminUserRepository } from '@/lib/firebase/repositories/admin-users';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'READER';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, profile }) {
      // Si tenemos el perfil de Google con el correo, buscamos el rol en Firestore
      if (profile && profile.email) {
        try {
          const adminUser = await adminUserRepository.getByEmail(profile.email);
          if (adminUser) {
            token.role = adminUser.role;
            token.isAdmin = adminUser.active;
          } else {
            token.role = null;
            token.isAdmin = false;
          }
        } catch (error) {
          console.error('Error fetching admin user role in jwt callback:', error);
          token.role = null;
          token.isAdmin = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || '';
        session.user.role = (token.role as AdminRole) || null;
        session.user.isAdmin = !!token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});

// Tipos extendidos de sesión de NextAuth v5
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: AdminRole | null;
      isAdmin: boolean;
    };
  }
}
