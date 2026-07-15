'use client'

import Link from 'next/link'
import { getGeneralContactLink } from '@/lib/whatsapp'

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-[#2D1B69] text-lg tracking-tight">
          ✦ Espíritu Ananda
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/servicios" className="hover:text-[#2D1B69] transition-colors">Sesiones</Link>
          <Link href="/tienda" className="hover:text-[#2D1B69] transition-colors">Tienda</Link>
          <Link href="/como-funciona" className="hover:text-[#2D1B69] transition-colors">Cómo funciona</Link>
        </nav>
        <a
          href={getGeneralContactLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#2D1B69] text-white text-sm px-4 py-2 rounded-full hover:bg-violet-800 transition-colors"
        >
          Reservar sesión
        </a>
      </div>
    </header>
  )
}
