import Link from 'next/link'
import { getGeneralContactLink } from '@/lib/whatsapp'

export default function HomePage() {
  const waLink = getGeneralContactLink()

  return (
    <main>
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-[#FAF5FF] to-white">
        <p className="text-violet-500 text-sm font-medium tracking-widest uppercase mb-4">
          Lecturas astrales · Cali, Colombia
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-[#2D1B69] leading-tight max-w-3xl">
          Tu cielo interior,
          <br />
          <span className="text-violet-400">revelado</span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl mt-6 max-w-xl">
          Sesiones de astrología y tarot personalizadas por WhatsApp.
          Productos artesanales con intención y alma.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <Link
            href="/servicios"
            className="bg-[#2D1B69] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-violet-800 transition-colors"
          >
            Ver sesiones
          </Link>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 text-gray-700 px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Escribir por WhatsApp
          </a>
        </div>
      </section>

      {/* Servicios destacados placeholder */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-violet-500 text-xs font-semibold uppercase tracking-widest mb-3">Servicios</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#2D1B69] mb-4">
            ¿Qué puedo hacer por ti?
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Cada lectura es una conversación entre tu carta natal y tu momento presente.
          </p>
          <Link
            href="/servicios"
            className="inline-block mt-8 text-violet-600 text-sm font-medium hover:underline"
          >
            Ver todos los servicios →
          </Link>
        </div>
      </section>

      {/* Tienda placeholder */}
      <section className="py-20 px-6 bg-[#FAF8FF]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-violet-500 text-xs font-semibold uppercase tracking-widest mb-3">Tienda</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#2D1B69] mb-4">
            Objetos con alma
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Productos artesanales elaborados con intención. Cada pieza lleva energía y cuidado.
          </p>
          <Link
            href="/tienda"
            className="inline-block mt-8 text-violet-600 text-sm font-medium hover:underline"
          >
            Explorar tienda →
          </Link>
        </div>
      </section>
    </main>
  )
}
