'use client'

import Image from 'next/image'
import { useCart } from '@/context/CartContext'

export interface ProductCardProps {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  imageUrl: string | null
  category?: string | null
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  stock,
  imageUrl,
  category,
}: ProductCardProps) {
  const { addItem } = useCart()

  const isLowStock = stock > 0 && stock < 5

  return (
    <div className="bg-white border border-ananda-100 rounded-3xl p-6 flex flex-col justify-between hover:shadow-premium-hover hover:border-ananda-400/30 transition-all duration-300 group">
      <div>
        {/* Aspect ratio cuadrado para la imagen */}
        <div className="relative w-full aspect-square bg-ananda-50/60 rounded-2xl overflow-hidden mb-4 flex items-center justify-center border border-ananda-100/50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <span className="text-4xl mb-2 text-ananda-500">✦</span>
              <span className="text-[11px] font-semibold text-ananda-700 uppercase tracking-wider">
                {category || 'Artesanal'}
              </span>
            </div>
          )}

          {/* Badge de Stock */}
          <div className="absolute top-3 right-3">
            {isLowStock ? (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
                🔥 Últimas {stock} unidades
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                En stock
              </span>
            )}
          </div>
        </div>

        {/* Info del producto */}
        <span className="text-[11px] font-bold text-ananda-500 uppercase tracking-wider block mb-1">
          {category || 'Producto Sagrado'}
        </span>
        <h3 className="font-display text-lg font-bold text-ananda-950 group-hover:text-ananda-500 transition-colors line-clamp-1">
          {name}
        </h3>
        <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
          {description || 'Objeto elaborado con intención para acompañar tus rituales.'}
        </p>
      </div>

      {/* Footer de Card: Precio y Botón de Carrito */}
      <div className="mt-6 pt-4 border-t border-ananda-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-gray-400 block uppercase font-medium">Precio</span>
          <span className="font-display text-xl font-bold text-amber-500">
            {formatCOP(price)}
          </span>
        </div>

        <button
          onClick={() => addItem({ id, name, price, imageUrl, stock })}
          className="px-4 py-2.5 rounded-full bg-ananda-900 text-white font-semibold text-xs hover:bg-ananda-500 transition-all duration-300 shadow-xs active:scale-95 flex items-center gap-1.5"
        >
          <span>🛒</span> Agregar
        </button>
      </div>
    </div>
  )
}
