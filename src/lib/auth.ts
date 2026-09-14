import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { adminUserRepository } from '@/lib/supabase/repositories/admin-users';
import { isDemoMode } from '@/lib/demoMode';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'READER';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, profile }) {
      if (user) {
        token.role = (user as any).role || null;
        token.isAdmin = (user as any).isAdmin ?? false;
        token.email = user.email || token.email;
      }

      const targetEmail = profile?.email || user?.email || (token.email as string);

      if (targetEmail) {
        if (isDemoMode()) {
          token.role = 'SUPER_ADMIN';
          token.isAdmin = true;
          return token;
        }

        try {
          const adminUser = await adminUserRepository.getByEmail(targetEmail);
          if (adminUser) {
            token.role = adminUser.role;
            token.isAdmin = adminUser.active;
          } else {
            const adminEmails = (process.env.ADMIN_EMAILS || '')
              .split(',')
              .map((e) => e.trim().toLowerCase());
            if (adminEmails.includes(targetEmail.toLowerCase())) {
              token.role = 'SUPER_ADMIN';
              token.isAdmin = true;
            } else {
              token.role = token.role || null;
              token.isAdmin = token.isAdmin ?? false;
            }
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
        session.user.isAdmin = Boolean(token.isAdmin ?? false);
      }
      return session;
    },
  },
});

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
