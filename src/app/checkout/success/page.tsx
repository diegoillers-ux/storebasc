'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { getGeneralContactLink, getServiceInquiryLink } from '@/lib/whatsapp'

function SuccessContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'booking'
  const id = searchParams.get('id') || 'ANANDA-8821'
  const name = searchParams.get('name') || 'Consultante'
  const serviceName = searchParams.get('service') || 'Sesión Astral'
  const date = searchParams.get('date') || ''
  const time = searchParams.get('time') || ''
  const total = searchParams.get('total') || ''

  const isBooking = type === 'booking'
  const waLink = isBooking && serviceName ? getServiceInquiryLink(serviceName) : getGeneralContactLink()

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-ananda-950 via-[#241554] to-ananda-900 text-white flex flex-col items-center justify-center p-6 overflow-hidden font-sans">
      {/* Animaciones de Partículas CSS y Estrellas */}
      <style jsx>{`
        @keyframes floatSparkle {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-18px) rotate(180deg); opacity: 1; }
          100% { transform: translateY(0px) rotate(360deg); opacity: 0.7; }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.15); opacity: 0.75; }
        }
        .animate-sparkle {
          animation: floatSparkle 5s ease-in-out infinite;
        }
        .animate-pulseGlow {
          animation: pulseGlow 4s ease-in-out infinite;
        }
      `}</style>

      {/* Luces y Neones Místicos */}
      <div className="absolute w-96 h-96 bg-ananda-500/25 rounded-full blur-3xl animate-pulseGlow pointer-events-none" />
      <div className="absolute w-72 h-72 bg-amber-500/15 rounded-full blur-2xl top-12 right-12 pointer-events-none" />

      {/* Partículas SVG de Estrellas Animadas */}
      <svg className="absolute inset-0 w-full h-full opacity-50 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <g fill="#D4A843">
          <circle cx="12%" cy="18%" r="2" className="animate-sparkle" />
          <circle cx="82%" cy="22%" r="3" className="animate-sparkle" />
          <circle cx="78%" cy="72%" r="2" className="animate-sparkle" />
          <circle cx="18%" cy="78%" r="2.5" className="animate-sparkle" />
          <polygon points="120,80 123,88 131,91 123,94 120,102 117,94 109,91 117,88" className="animate-sparkle" />
          <polygon points="850,250 852,256 858,258 852,260 850,266 848,260 842,258 848,256" className="animate-sparkle" />
        </g>
      </svg>

      {/* Tarjeta Central Esmerilada */}
      <div className="relative z-10 max-w-lg w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl text-center">
        {/* Ícono Dorado Central (Sol / Estrella) */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 p-0.5 mx-auto mb-6 shadow-xl shadow-amber-500/20">
          <div className="w-full h-full rounded-full bg-ananda-950 flex items-center justify-center">
            <span className="text-amber-400 text-4xl font-bold">✦</span>
          </div>
        </div>

        {/* Título Principal */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
          {isBooking ? 'Tu sesión ha sido agendada' : 'Tu pedido está en camino'}
        </h1>

        <p className="text-gray-300 text-sm mb-6">
          ¡Gracias por tu confianza, <span className="font-semibold text-amber-300">{name}</span>! Hemos registrado tu solicitud exitosamente.
        </p>

        {/* Card de Resumen */}
        <div className="bg-ananda-950/60 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-left text-xs space-y-3 mb-8">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-gray-400 uppercase tracking-wider font-semibold">Identificador:</span>
            <span className="font-mono font-bold text-amber-300 text-sm">{id}</span>
          </div>

          {isBooking ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">Servicio:</span>
                <span className="font-bold text-white">{serviceName}</span>
              </div>
              {date && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Fecha & Hora:</span>
                  <span className="font-bold text-white">{date} {time ? `a las ${time}` : ''}</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 text-gray-300 leading-relaxed text-[11px]">
                📌 <strong className="text-white">Instrucciones:</strong> Te enviaremos los detalles de tu sesión por correo y WhatsApp en cuanto se valide tu transferencia.
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">Tipo de Compra:</span>
                <span className="font-bold text-white">Productos Físicos Artesanales</span>
              </div>
              {total && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Monto Registrado:</span>
                  <span className="font-bold text-amber-300">{total}</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 text-gray-300 leading-relaxed text-[11px]">
                🚚 <strong className="text-white">Instrucciones:</strong> Tu comprobante ha sido ingresado para conciliación. Preparamos tus productos con intención pura.
              </div>
            </>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="space-y-3">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            Contactar a Lina por WhatsApp
          </a>

          <Link
            href="/"
            className="w-full py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all duration-300 block text-center"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function UnifiedSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ananda-950 flex items-center justify-center text-white font-sans">
          Cargando confirmación...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
