'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Step1ClientFormProps {
  service: {
    id: string
    name: string
    price: number
    duration: number
  }
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function Step1ClientForm({ service }: Step1ClientFormProps) {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [context, setContext] = useState('')

  // Cargar datos previos si existen en sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('ananda_checkout_data')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.name) setName(parsed.name)
        if (parsed.email) setEmail(parsed.email)
        if (parsed.whatsapp) setWhatsapp(parsed.whatsapp)
        if (parsed.birthdate) setBirthdate(parsed.birthdate)
        if (parsed.context) setContext(parsed.context)
      }
    } catch (e) {
      console.error('Error reading checkout session data:', e)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !whatsapp || !birthdate) return

    const checkoutData = {
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      duration: service.duration,
      name,
      email,
      whatsapp,
      birthdate,
      context,
    }

    try {
      sessionStorage.setItem('ananda_checkout_data', JSON.stringify(checkoutData))
    } catch (e) {
      console.error('Error saving checkout session data:', e)
    }

    router.push(`/checkout/${service.id}/schedule`)
  }

  return (
    <div className="w-full min-h-screen bg-ananda-50 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar de 3 Pasos */}
        <div className="mb-10 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-ananda-400/20 shadow-xs flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2 text-ananda-500">
            <span className="w-6 h-6 rounded-full bg-ananda-500 text-white flex items-center justify-center text-[11px] font-bold">
              1
            </span>
            <span>Tus Datos</span>
          </div>
          <div className="h-0.5 flex-1 bg-ananda-200 mx-3" />
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[11px] font-bold">
              2
            </span>
            <span>Agendar</span>
          </div>
          <div className="h-0.5 flex-1 bg-gray-200 mx-3" />
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[11px] font-bold">
              3
            </span>
            <span>Pago Seguro</span>
          </div>
        </div>

        {/* Card Principal */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-ananda-400/20 shadow-xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-ananda-500 mb-2 block">
              Paso 1 de 3 · Registro Astral
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ananda-950 mb-2">
              {service.name}
            </h1>
            <p className="font-display text-2xl font-bold text-amber-500">
              {formatCOP(service.price)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Bienvenido/a a tu espacio sagrado. Compártenos tus datos para personalizar tu sesión.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                Nombre Completo *
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Camila Rodríguez"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-ananda-950 placeholder-gray-400 text-sm focus:outline-none focus:border-ananda-500 focus:ring-2 focus:ring-ananda-500/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                  Correo Electrónico *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-ananda-950 placeholder-gray-400 text-sm focus:outline-none focus:border-ananda-500 focus:ring-2 focus:ring-ananda-500/20 transition-all"
                />
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                  WhatsApp de Contacto *
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-ananda-950 placeholder-gray-400 text-sm focus:outline-none focus:border-ananda-500 focus:ring-2 focus:ring-ananda-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="birthdate" className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                Fecha de Nacimiento *
              </label>
              <input
                id="birthdate"
                type="date"
                required
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-ananda-950 placeholder-gray-400 text-sm focus:outline-none focus:border-ananda-500 focus:ring-2 focus:ring-ananda-500/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="context" className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                ¿Qué te gustaría explorar en la lectura? (Opcional)
              </label>
              <textarea
                id="context"
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Breve nota sobre temas de amor, carrera, momento de cambio o intención especial..."
                className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-ananda-950 placeholder-gray-400 text-sm focus:outline-none focus:border-ananda-500 focus:ring-2 focus:ring-ananda-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-ananda-900 text-white font-semibold text-sm hover:bg-ananda-500 transition-all duration-300 shadow-lg shadow-ananda-900/20 mt-6 active:scale-98"
            >
              Continuar a Elegir Horario →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
