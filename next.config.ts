import type { NextConfig } from 'next'

const nextConfig: any = {
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
    return [
      {
        source: '/api/webhooks/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },

  // Ignorar errores de TypeScript en build de Preview (no en producción)
  typescript: {
    ignoreBuildErrors: process.env.VERCEL_ENV === 'preview',
  },
}

export default nextConfig
