import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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

  // Ignorar errores de ESLint/TypeScript en build de Preview (no en producción)
  eslint: {
    ignoreDuringBuilds: process.env.VERCEL_ENV === 'preview',
  },
  typescript: {
    ignoreBuildErrors: process.env.VERCEL_ENV === 'preview',
  },
}

export default nextConfig
