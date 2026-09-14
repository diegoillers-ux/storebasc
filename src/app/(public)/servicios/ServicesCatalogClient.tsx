'use client'

import { useState } from 'react'
import ServiceCard from '@/components/public/ServiceCard'
import type { CatalogService } from './page'

export default function ServicesCatalogClient({ services }: { services: CatalogService[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')

  // Extraer categorías únicas preservando el orden
  const categories = ['Todos', ...Array.from(new Set(services.map((s) => s.category)))]

  // Filtrar servicios según categoría seleccionada
  const filteredServices =
    selectedCategory === 'Todos'
      ? services
      : services.filter((s) => s.category === selectedCategory)

  return (
    <main className="w-full min-h-screen bg-[#FAF8FF] py-16 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Hero Pequeño de Servicios */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-ananda-100 text-ananda-800 text-xs font-semibold uppercase tracking-widest mb-4">
            <span className="text-amber-500">✦</span> Catálogo Místico
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-ananda-950 tracking-tight leading-tight mb-4">
            Sesiones & Lecturas Astrales
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Encuentra la sesión ideal para conectar con la sabiduría de los astros, comprender tu mapa natal y recibir claridad en tu presente.
          </p>
        </div>

        {/* Filtro de Categorías Client-Side */}
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

        {/* Grid de Servicios: 3 columnas en desktop, 1 en mobile */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                description={service.description}
                price={service.price}
                duration={service.duration}
                category={service.category}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto my-12 border border-ananda-100">
            <span className="text-4xl block mb-3 text-ananda-500">✨</span>
            <h3 className="font-display text-xl font-bold text-ananda-950 mb-2">
              No hay sesiones en esta categoría
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Prueba seleccionando otra categoría o explora todas las lecturas disponibles.
            </p>
            <button
              onClick={() => setSelectedCategory('Todos')}
              className="px-6 py-2.5 rounded-full bg-ananda-900 text-white font-semibold text-xs hover:bg-ananda-500 transition-colors"
            >
              Ver todas las sesiones
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
