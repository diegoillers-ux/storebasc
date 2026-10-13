'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getGeneralContactLink } from '@/lib/whatsapp'
import { useCart } from '@/context/CartContext'
import CartDrawer from './CartDrawer'

export function PublicHeader() {
  const { totalItems, toggleCart } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-ananda-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-ananda-900 text-lg tracking-tight hover:opacity-90 transition-opacity">
          ✦ Espíritu Ananda
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
          <Link href="/" className="hover:text-ananda-500 transition-colors">
            Inicio
          </Link>
          <Link href="/servicios" className="hover:text-ananda-500 transition-colors">
            Sesiones
          </Link>
          <Link href="/tienda" className="hover:text-ananda-500 transition-colors">
            Tienda
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Botón Flotante de Carrito con Badge */}
          <button
            onClick={toggleCart}
            className="relative p-2.5 rounded-full text-ananda-900 hover:bg-ananda-100 transition-colors flex items-center justify-center"
            aria-label="Abrir carrito de compras"
          >
            <span className="text-xl">🛍️</span>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-ananda-500 text-white font-bold text-[11px] rounded-full flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </button>

          <a
            href={getGeneralContactLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-ananda-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-ananda-500 transition-colors hidden sm:inline-block shadow-sm"
          >
            Reservar sesión
          </a>

          {/* Menú Hamburguesa para Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-ananda-900 hover:bg-ananda-100 transition-colors"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-ananda-100 px-6 py-4 space-y-3 font-medium text-sm text-gray-700">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-ananda-500 border-b border-gray-100"
          >
            Inicio
          </Link>
          <Link
            href="/servicios"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-ananda-500 border-b border-gray-100"
          >
            Sesiones & Lecturas
          </Link>
          <Link
            href="/tienda"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-ananda-500 border-b border-gray-100"
          >
            Tienda Holística
          </Link>
          <a
            href={getGeneralContactLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-ananda-900 text-white text-xs font-semibold py-3 rounded-full hover:bg-ananda-500 transition-colors mt-2"
          >
            Reservar por WhatsApp
          </a>
        </div>
      )}

      <CartDrawer />
    </header>
  )
}
