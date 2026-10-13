import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Redirecciones de compatibilidad para enlaces legados
  async redirects() {
    return [
      {
        source: '/admin/reservas',
        destination: '/admin/agenda',
        permanent: true,
      },
    ]
  },

  // Imágenes externas permitidas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // avatares Google OAuth
      },
    ],
  },

  // Headers de seguridad
  async headers() {
    const isDev = process.env.NODE_ENV === 'development'

    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Content-Security-Policy', value:
          [
            "default-src 'self'",
            isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://res.cloudinary.com https://*.vercel-storage.com https://lh3.googleusercontent.com",
            "font-src 'self' data:",
            "connect-src 'self' https://*.supabase.co",
            "manifest-src 'self'",
            "worker-src 'self' blob:",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; ') },
    ]

    return [
      {
        source: '/api/webhooks/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

}

export default nextConfig
