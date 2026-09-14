'use client'

import { useState } from 'react'
import ProductCard from '@/components/public/ProductCard'
import type { StoreProduct } from './page'

export default function StoreCatalogClient({ products }: { products: StoreProduct[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')

  // Categorías únicas
  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.category)))]

  // Filtrado de productos por categoría
  const filteredProducts =
    selectedCategory === 'Todos'
      ? products
      : products.filter((p) => p.category === selectedCategory)

  return (
    <main className="w-full min-h-screen bg-[#FAF8FF] py-16 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Hero Pequeño de Tienda */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-ananda-100 text-ananda-800 text-xs font-semibold uppercase tracking-widest mb-4">
            <span className="text-amber-500">✦</span> Tienda Holística & Ritual
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-ananda-950 tracking-tight leading-tight mb-4">
            Objetos con Alma & Propósito
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Herramientas energéticas y botánica sagrada intencionadas para acompañar tu altar, elevar la frecuencia de tus espacios y cuidar tu energía.
          </p>
        </div>

        {/* Filtro de Categorías */}
        <div className="flex flex-wrap justify-center items-center gap-2.5 mb-12">
          {categories.map((category) => {
            const isActive = selectedCategory === category
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full font-semibold text-xs transition-all duration-300 transform active:scale-95 ${
                  isActive
                    ? 'bg-ananda-900 text-white shadow-md shadow-ananda-900/20'
                    : 'bg-white/80 border border-ananda-200/60 text-ananda-800 hover:bg-ananda-100 hover:border-ananda-400/40'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>

        {/* Grid de Productos: 4 columnas en desktop grande, 2 en tablet, 1 en mobile */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                stock={product.stock}
                imageUrl={product.imageUrl}
                category={product.category}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto my-12 border border-ananda-100">
            <span className="text-4xl block mb-3 text-ananda-500">🔮</span>
            <h3 className="font-display text-xl font-bold text-ananda-950 mb-2">
              No hay productos disponibles en esta categoría
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Prueba seleccionando otra categoría para explorar la colección.
            </p>
            <button
              onClick={() => setSelectedCategory('Todos')}
              className="px-6 py-2.5 rounded-full bg-ananda-900 text-white font-semibold text-xs hover:bg-ananda-500 transition-colors"
            >
              Ver todos los productos
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
