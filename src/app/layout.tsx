import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import PwaRegister from '@/components/PwaRegister';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Astrologia & Canalizacion',
  description: 'Servicios Holisticos de Astrologia y Canalizacion de Energia',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/shop-logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Perlanda',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <PwaRegister />
      </body>
    </html>
  );
}