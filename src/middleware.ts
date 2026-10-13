import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/demoMode';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const isAdmin = !!(req.auth?.user as any)?.isAdmin;
  const isOnAdmin = req.nextUrl.pathname.startsWith('/admin');
  
  // Permitir paso directo si está activo el modo demo
  const bypassActive = isDemoMode();

  if (isOnAdmin && !bypassActive) {
    if (!isLoggedIn || !isAdmin) {
      return NextResponse.redirect(new URL('/login?error=AccessDenied', req.url));
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
