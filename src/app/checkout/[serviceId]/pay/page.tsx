'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getGeneralContactLink } from '@/lib/whatsapp'

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CheckoutPayPage() {
  const params = useParams()
  const serviceId = params?.serviceId as string

  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileBase64, setFileBase64] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [successBooking, setSuccessBooking] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const isGatewayMode = process.env.NEXT_PUBLIC_PAYMENT_MODE === 'gateway'

  const nequiNumber = process.env.NEXT_PUBLIC_NEQUI_NUMBER || '300 123 4567'
  const daviplataNumber = process.env.NEXT_PUBLIC_DAVIPLATA_NUMBER || '300 123 4567'
  const bancolombiaAccount = process.env.NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT || 'Ahorros 123-456789-00'

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('ananda_checkout_data')
      if (stored) {
        setCheckoutData(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Error reading checkout data:', e)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)

    const reader = new FileReader()
    reader.onloadend = () => {
      setFileBase64(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmitManualPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkoutData) return

    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: checkoutData.serviceId || serviceId,
          customerData: {
            name: checkoutData.name,
            email: checkoutData.email,
            whatsapp: checkoutData.whatsapp,
            birthdate: checkoutData.birthdate,
            context: checkoutData.context,
          },
          date: checkoutData.date,
          time: checkoutData.time,
          paymentProof: fileBase64 || null,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al procesar la reserva.')
      }

      // Limpiar datos de checkout tras éxito
      sessionStorage.removeItem('ananda_checkout_data')
      setSuccessBooking(data)
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al enviar el pago.')
    } finally {
      setSubmitting(false)
    }
  }

  // Vista de éxito tras confirmar el pago
  if (successBooking) {
    return (
      <div className="w-full min-h-screen bg-ananda-50 py-16 px-4 font-sans flex items-center justify-center">
        <div className="max-w-lg w-full glass-card rounded-3xl p-8 sm:p-10 border border-ananda-400/30 text-center shadow-2xl">
          <span className="text-5xl block mb-4">🌟</span>
          <h1 className="font-display text-3xl font-bold text-ananda-950 mb-2">
            ¡Reserva Solicitada con Éxito!
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Hemos recibido los detalles de tu sesión y tu comprobante de pago. Te notificaremos por correo y WhatsApp en cuanto confirmemos la transacción.
          </p>

          <div className="p-4 rounded-2xl bg-ananda-100/60 text-left text-xs space-y-2 mb-6 border border-ananda-200">
            <div>
              <span className="font-bold text-ananda-900">Código de Reserva:</span>{' '}
              <span className="font-mono">{successBooking.bookingId || 'BNK-PENDING'}</span>
            </div>
            <div>
              <span className="font-bold text-ananda-900">Sesión:</span>{' '}
              {checkoutData?.serviceName || 'Lectura Astral'}
            </div>
            <div>
              <span className="font-bold text-ananda-900">Fecha & Hora:</span>{' '}
              {checkoutData?.date} a las {checkoutData?.time}
            </div>
          </div>

          <a
            href={getGeneralContactLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-md block text-center mb-3"
          >
            Hablar por WhatsApp con Lina
          </a>

          <Link
            href="/"
            className="text-xs font-semibold text-ananda-500 hover:underline"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    )
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
            <span className="w-6 h-6 rounded-full bg-ananda-100 text-ananda-800 flex items-center justify-center text-[11px] font-bold">
              ✓
            </span>
            <span>Agendar</span>
          </div>
          <div className="h-0.5 flex-1 bg-ananda-500 mx-3" />
          <div className="flex items-center gap-2 text-ananda-500">
            <span className="w-6 h-6 rounded-full bg-ananda-500 text-white flex items-center justify-center text-[11px] font-bold">
              3
            </span>
            <span>Pago Seguro</span>
          </div>
        </div>

        {/* Resumen de la Reserva */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-ananda-400/20 shadow-xl mb-8">
          <h2 className="font-display text-2xl font-bold text-ananda-950 mb-4">
            Resumen de tu Reserva
          </h2>

          <div className="bg-white/80 p-5 rounded-2xl border border-ananda-100 text-sm space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Servicio:</span>
              <span className="font-bold text-ananda-950">{checkoutData?.serviceName || 'Sesión Astral'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Consultante:</span>
              <span className="font-bold text-ananda-950">{checkoutData?.name || 'Cliente'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha & Hora:</span>
              <span className="font-bold text-ananda-950">
                {checkoutData?.date} — {checkoutData?.time}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-ananda-100">
              <span className="text-gray-500 font-bold uppercase text-xs">Total a Transferir:</span>
              <span className="font-display text-xl font-bold text-amber-500">
                {checkoutData?.servicePrice ? formatCOP(checkoutData.servicePrice) : '$150.000 COP'}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* BIFURCACIÓN DE PAGO */}
          {isGatewayMode ? (
            <div className="text-center space-y-4">
              <p className="text-xs text-gray-600">
                Serás redirigido a la pasarela segura de Wompi para realizar tu pago en línea.
              </p>
              <button
                onClick={() => alert('Pasarela Wompi: Redirigiendo a checkout de pago...')}
                className="w-full py-4 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-all duration-300 shadow-md"
              >
                Pagar con Wompi 💳
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitManualPayment} className="space-y-6">
              {/* Cuentas Bancarias */}
              <div>
                <label className="block text-xs font-bold text-ananda-900 uppercase mb-3">
                  1. Realiza la transferencia a una de nuestras cuentas
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                    <span className="font-bold block text-purple-900 mb-1">💜 Nequi</span>
                    <span className="font-mono text-gray-700">{nequiNumber}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                    <span className="font-bold block text-rose-900 mb-1">❤️ Daviplata</span>
                    <span className="font-mono text-gray-700">{daviplataNumber}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="font-bold block text-amber-900 mb-1">💛 Bancolombia</span>
                    <span className="font-mono text-gray-700">{bancolombiaAccount}</span>
                  </div>
                </div>
              </div>

              {/* Subir comprobante */}
              <div>
                <label htmlFor="voucher" className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                  2. Adjunta tu comprobante de pago (Imagen o PDF) *
                </label>
                <input
                  id="voucher"
                  type="file"
                  accept="image/*,.pdf"
                  required
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-ananda-100 file:text-ananda-900 hover:file:bg-ananda-200 cursor-pointer"
                />
                {file && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    ✓ Archivo seleccionado: {file.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !file}
                className="w-full py-4 rounded-full bg-ananda-900 text-white font-semibold text-sm hover:bg-ananda-500 disabled:opacity-40 transition-all duration-300 shadow-lg shadow-ananda-900/20 active:scale-98"
              >
                {submitting ? 'Procesando Reserva...' : 'Confirmar Pago y Cita →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
