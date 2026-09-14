'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, subtotal, totalItems } = useCart()

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop de Fondo */}
      <div
        className="fixed inset-0 bg-ananda-950/60 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-ananda-100 z-50">
          {/* Header del Carrito */}
          <div className="p-6 border-b border-ananda-100 flex items-center justify-between bg-ananda-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xl text-ananda-500">🛍️</span>
              <h2 className="font-display text-xl font-bold text-ananda-950">
                Tu Carrito ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="w-9 h-9 rounded-full bg-white border border-ananda-200 text-gray-500 hover:text-ananda-950 hover:bg-ananda-100 transition-colors flex items-center justify-center font-bold text-sm"
              aria-label="Cerrar carrito"
            >
              ✕
            </button>
          </div>

          {/* Lista de Ítems */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-ananda-100 hover:border-ananda-300 transition-all"
                >
                  {/* Thumbnail de Imagen */}
                  <div className="relative w-16 h-16 rounded-xl bg-ananda-100/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xl text-ananda-500">✦</span>
                    )}
                  </div>

                  {/* Info de Producto */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-sm text-ananda-950 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs font-semibold text-amber-500 mt-0.5">
                      {formatCOP(item.price)}
                    </p>

                    {/* Selector de Cantidad */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-white border border-ananda-200 text-xs font-bold text-ananda-800 hover:bg-ananda-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold text-ananda-950 px-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-6 h-6 rounded-md bg-white border border-ananda-200 text-xs font-bold text-ananda-800 hover:bg-ananda-100 disabled:opacity-40 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Botón de Eliminar */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-coral-600 transition-colors p-1 text-sm"
                    title="Eliminar producto"
                  >
                    🗑️
                  </button>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <span className="text-5xl block mb-4 text-ananda-400">✨</span>
                <h3 className="font-display text-lg font-bold text-ananda-950 mb-1">
                  Tu carrito está vacío
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mb-6">
                  Explora nuestros objetos sagrados intencionados e inicia tu pedido.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 rounded-full bg-ananda-900 text-white font-semibold text-xs hover:bg-ananda-500 transition-colors shadow-sm"
                >
                  Explorar la Tienda
                </button>
              </div>
            )}
          </div>

          {/* Footer con Subtotal y Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-ananda-100 bg-ananda-50/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase font-semibold">Subtotal</span>
                <span className="font-display text-xl font-bold text-amber-500">
                  {formatCOP(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mb-4">
                * Los datos de envío y pago se completan en el siguiente paso.
              </p>

              <Link
                href="/checkout/product"
                onClick={closeCart}
                className="w-full py-3.5 rounded-full bg-ananda-900 text-white font-semibold text-sm hover:bg-ananda-500 transition-all duration-300 text-center block shadow-lg shadow-ananda-900/20"
              >
                Finalizar compra →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
