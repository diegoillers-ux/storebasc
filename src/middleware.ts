import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const isOnAdmin = req.nextUrl.pathname.startsWith('/admin');
  
  // Si está activo el bypass en desarrollo, permitir paso directo sin redirección
  const bypassActive = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  if (isOnAdmin && !isLoggedIn && !bypassActive) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
