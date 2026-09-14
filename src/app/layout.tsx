import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import AuthProvider from '@/components/AuthProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Espíritu Ananda — Lecturas astrales y productos artesanales',
    template: '%s | Espíritu Ananda',
  },
  description:
    'Lecturas astrales, tarot y productos artesanales con alma. Sesiones personalizadas por WhatsApp desde Cali, Colombia.',
  keywords: ['lecturas astrales', 'tarot', 'astrología', 'productos artesanales', 'Cali', 'Colombia'],
  authors: [{ name: 'Espíritu Ananda' }],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Espíritu Ananda',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2D1B69',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
