import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import type { AdminRole } from '@prisma/client'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    async session({ session, user }) {
      // Añadir rol y id al objeto de sesión
      if (session.user) {
        session.user.id = user.id
        // Buscar rol en AdminUser
        const adminUser = await db.adminUser.findUnique({
          where: { email: user.email! },
          select: { role: true, active: true },
        })
        session.user.role = adminUser?.role ?? null
        session.user.isAdmin = !!adminUser?.active
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})

// Tipos extendidos de sesión
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: AdminRole | null
      isAdmin: boolean
    }
  }
}
