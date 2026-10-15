'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AvailabilityCalendar from '@/components/public/AvailabilityCalendar'

export default function CheckoutSchedulePage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params?.serviceId as string

  const [checkoutData, setCheckoutData] = useState<{ serviceName?: string; serviceId?: string; [key: string]: unknown } | null>(null)

  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        const stored = sessionStorage.getItem('ananda_checkout_data')
        if (stored) {
          setCheckoutData(JSON.parse(stored))
        }
      } catch (e) {
        console.error('Error reading checkout data:', e)
      }
    });
  }, [])

  const handleConfirmSchedule = (date: string, time: string) => {
    try {
      const current = checkoutData || {}
      const updated = {
        ...current,
        serviceId: serviceId || current.serviceId,
        date,
        time,
      }
      sessionStorage.setItem('ananda_checkout_data', JSON.stringify(updated))
      router.push(`/checkout/${serviceId}/pay`)
    } catch (e) {
      console.error('Error saving schedule to sessionStorage:', e)
    }
  }

  return (
    <div className="w-full min-h-screen bg-ananda-50 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-10 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-ananda-400/20 shadow-xs flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2 text-ananda-500">
            <span className="w-6 h-6 rounded-full bg-ananda-100 text-ananda-800 flex items-center justify-center text-[11px] font-bold">
              ✓
            </span>
            <span>Tus Datos</span>
          </div>
          <div className="h-0.5 flex-1 bg-ananda-500 mx-3" />
          <div className="flex items-center gap-2 text-ananda-500">
            <span className="w-6 h-6 rounded-full bg-ananda-500 text-white flex items-center justify-center text-[11px] font-bold">
              2
            </span>
            <span>Agendar</span>
          </div>
          <div className="h-0.5 flex-1 bg-ananda-200 mx-3" />
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[11px] font-bold">
              3
            </span>
            <span>Pago Seguro</span>
          </div>
        </div>

        {/* Card Principal de Agendamiento */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-ananda-400/20 shadow-xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-ananda-500 mb-2 block">
              Paso 2 de 3 · Selección de Fecha & Hora
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ananda-950 mb-2">
              Agenda tu Sesión Astral
            </h1>
            <p className="text-xs text-gray-500">
              {checkoutData?.serviceName
                ? `Reservando: ${checkoutData.serviceName}`
                : 'Selecciona el momento que resuene contigo.'}
            </p>
          </div>

          <AvailabilityCalendar
            serviceId={serviceId}
            serviceName={checkoutData?.serviceName || 'Sesión Astral'}
            onConfirmSchedule={handleConfirmSchedule}
          />
        </div>
      </div>
    </div>
  )
}
