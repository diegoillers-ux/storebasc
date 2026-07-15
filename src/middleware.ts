import { auth } from '@/lib/auth';

export default auth((req) => {
  const reqUrl = new URL(req.url);
  const isAdminPath = reqUrl.pathname.startsWith('/admin');
  const isLoggedIn = !!req.auth;

  if (isAdminPath) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/login', req.nextUrl));
    }

    // Validar si el usuario es un administrador activo
    const isAdmin = req.auth?.user?.isAdmin;
    if (!isAdmin) {
      return Response.redirect(new URL('/login?error=AccessDenied', req.nextUrl));
    }
  }
});

export const config = {
  matcher: ['/admin/:path*'],
};
