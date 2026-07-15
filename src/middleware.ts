import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación administrativa
const ADMIN_ROUTES = ['/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger rutas admin
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    // TODO: Integrar con NextAuth v5 para verificar sesión y rol
    // Por ahora, placeholder para la lógica de auth
    const isAuthenticated = request.cookies.has('next-auth.session-token') ||
      request.cookies.has('__Secure-next-auth.session-token')

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
