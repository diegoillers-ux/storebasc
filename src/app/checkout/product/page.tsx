'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getGeneralContactLink } from '@/lib/whatsapp'

interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string | null
  stock: number
  quantity: number
}

interface ShippingData {
  name: string
  phone: string
  email: string
  address: string
  neighborhood: string
  city: string
  notes: string
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ProductCheckoutWizard() {
  const [step, setStep] = useState<number>(1)
  const [items, setItems] = useState<CartItem[]>([])
  const [shippingData, setShippingData] = useState<ShippingData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    neighborhood: '',
    city: 'Cali',
    notes: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [fileBase64, setFileBase64] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [orderResult, setOrderResult] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const isGatewayMode = process.env.NEXT_PUBLIC_PAYMENT_MODE === 'gateway'

  const nequiNumber = process.env.NEXT_PUBLIC_NEQUI_NUMBER || '300 123 4567'
  const daviplataNumber = process.env.NEXT_PUBLIC_DAVIPLATA_NUMBER || '300 123 4567'
  const bancolombiaAccount = process.env.NEXT_PUBLIC_BANCOLOMBIA_ACCOUNT || 'Ahorros 123-456789-00'

  // 1. Cargar carrito desde sessionStorage al iniciar
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('ananda_cart')
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Error loading cart for checkout:', e)
    }
  }, [])

  // Sincronizar cambios de cantidad en el carrito
  const updateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(id)
      return
    }
    const updated = items.map((item) =>
      item.id === id ? { ...item, quantity: Math.min(newQty, item.stock || 99) } : item
    )
    setItems(updated)
    sessionStorage.setItem('ananda_cart', JSON.stringify(updated))
  }

  const removeItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id)
    setItems(updated)
    sessionStorage.setItem('ananda_cart', JSON.stringify(updated))
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = 0 // A convenir por WhatsApp / gratis local
  const grandTotal = subtotal + shippingCost

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)

    const reader = new FileReader()
    reader.onloadend = () => {
      setFileBase64(reader.result as string)
    }
    reader.readAsDataURL(selected)
  }

  // Enviar pedido al servidor en Paso 3
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingData,
          subtotal,
          shippingCost,
          total: grandTotal,
          paymentProof: fileBase64 || null,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al procesar la orden de compra.')
      }

      // Limpiar sessionStorage del carrito
      sessionStorage.removeItem('ananda_cart')
      setOrderResult(data)
      setStep(4) // Pasar al paso de confirmación
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al enviar el pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-ananda-50 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Stepper Visual de 4 Pasos */}
        <div className="mb-10 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-ananda-400/20 shadow-xs flex items-center justify-between text-xs font-semibold overflow-x-auto">
          {/* Paso 1 */}
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-ananda-500' : 'text-gray-400'}`}>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step > 1 ? 'bg-ananda-100 text-ananda-800' : step === 1 ? 'bg-ananda-500 text-white' : 'bg-gray-100'
              }`}
            >
              {step > 1 ? '✓' : '1'}
            </span>
            <span>Resumen</span>
          </div>

          <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-ananda-500' : 'bg-gray-200'}`} />

          {/* Paso 2 */}
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-ananda-500' : 'text-gray-400'}`}>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step > 2 ? 'bg-ananda-100 text-ananda-800' : step === 2 ? 'bg-ananda-500 text-white' : 'bg-gray-100'
              }`}
            >
              {step > 2 ? '✓' : '2'}
            </span>
            <span>Envío</span>
          </div>

          <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-ananda-500' : 'bg-gray-200'}`} />

          {/* Paso 3 */}
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-ananda-500' : 'text-gray-400'}`}>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step > 3 ? 'bg-ananda-100 text-ananda-800' : step === 3 ? 'bg-ananda-500 text-white' : 'bg-gray-100'
              }`}
            >
              {step > 3 ? '✓' : '3'}
            </span>
            <span>Pago</span>
          </div>

          <div className={`h-0.5 flex-1 mx-2 ${step >= 4 ? 'bg-ananda-500' : 'bg-gray-200'}`} />

          {/* Paso 4 */}
          <div className={`flex items-center gap-2 ${step === 4 ? 'text-ananda-500' : 'text-gray-400'}`}>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 4 ? 'bg-ananda-500 text-white' : 'bg-gray-100'
              }`}
            >
              4
            </span>
            <span>Confirmación</span>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* PASO 1 — RESUMEN DEL CARRITO */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-ananda-400/20 shadow-xl">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-ananda-500 mb-2 block">
                Paso 1 de 4 · Carrito de Compras
              </span>
              <h1 className="font-display text-3xl font-bold text-ananda-950">
                Resumen de Productos
              </h1>
            </div>

            {items.length > 0 ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 border border-ananda-100"
                    >
                      <div className="relative w-16 h-16 rounded-xl bg-ananda-50 overflow-hidden flex-shrink-0 flex items-center justify-center border">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        ) : (
                          <span className="text-2xl text-ananda-500">✦</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-base text-ananda-950 truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-amber-500 font-semibold">
                          {formatCOP(item.price)}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-md bg-ananda-50 border border-ananda-200 text-xs font-bold text-ananda-800"
                          >
                            -
                          </button>
                          <span className="text-xs font-semibold px-2">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-md bg-ananda-50 border border-ananda-200 text-xs font-bold text-ananda-800"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-display font-bold text-base text-ananda-950 block">
                          {formatCOP(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-gray-400 hover:text-coral-600 mt-1"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal Box */}
                <div className="p-5 rounded-2xl bg-ananda-100/50 border border-ananda-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal Ítems:</span>
                    <span className="font-bold text-ananda-950">{formatCOP(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Costo de Envío:</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      A convenir por WhatsApp
                    </span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-ananda-200">
                    <span className="font-bold text-ananda-950">Total General:</span>
                    <span className="font-display font-bold text-amber-500">{formatCOP(grandTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 rounded-full bg-ananda-900 text-white font-semibold text-sm hover:bg-ananda-500 transition-all duration-300 shadow-lg shadow-ananda-900/20 active:scale-98"
                >
                  Continuar a Datos de Envío →
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-5xl block mb-4">🛍️</span>
                <h2 className="font-display text-xl font-bold text-ananda-950 mb-2">
                  Tu carrito está vacío
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Agrega algunos objetos sagrados de nuestra tienda antes de proceder.
                </p>
                <Link
                  href="/tienda"
                  className="px-8 py-3.5 rounded-full bg-ananda-900 text-white font-semibold text-sm hover:bg-ananda-500 transition-colors inline-block"
                >
                  Ver Productos en la Tienda
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* PASO 2 — DATOS DE ENVÍO */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-ananda-400/20 shadow-xl">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-ananda-500 mb-2 block">
                Paso 2 de 4 · Dirección & Destinatario
              </span>
              <h1 className="font-display text-3xl font-bold text-ananda-950">
                Datos de Envío
              </h1>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (shippingData.name && shippingData.phone && shippingData.email && shippingData.address && shippingData.neighborhood) {
                  setStep(3)
                }
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                  Nombre Completo del Destinatario *
                </label>
                <input
                  type="text"
                  required
                  value={shippingData.name}
                  onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })}
                  placeholder="Ej. Sofia Gomez"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-ananda-950 placeholder-gray-400 text-sm focus:outline-none focus:border-ananda-500 focus:ring-2 focus:ring-ananda-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                    WhatsApp de Contacto *
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingData.phone}
                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                    placeholder="+57 300 123 4567"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-ananda-950 placeholder-gray-400 text-sm focus:outline-none focus:border-ananda-500 focus:ring-2 focus:ring-ananda-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={shippingData.email}
                    onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-ananda-950 placeholder-gray-400 text-sm focus:outline-none focus:border-ananda-500 focus:ring-2 focus:ring-ananda-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                  Dirección Completa de Entrega *
                </label>
                <input
                  type="text"
                  required
                  value={shippingData.address}
                  onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                  placeholder="Calle 5 # 24 - 10, Apto 302"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-ananda-950 placeholder-gray-400 text-sm focus:outline-none focus:border-ananda-500 focus:ring-2 focus:ring-ananda-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                    Barrio *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingData.neighborhood}
                    onChange={(e) => setShippingData({ ...shippingData, neighborhood: e.target.value })}
                    placeholder="Ej. San Fernando"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-ananda-950 placeholder-gray-400 text-sm focus:outline-none focus:border-ananda-500 focus:ring-2 focus:ring-ananda-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingData.city}
                    onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                    placeholder="Cali"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-ananda-950 placeholder-gray-400 text-sm focus:outline-none focus:border-ananda-500 focus:ring-2 focus:ring-ananda-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                  Indicaciones Adicionales de Entrega (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={shippingData.notes}
                  onChange={(e) => setShippingData({ ...shippingData, notes: e.target.value })}
                  placeholder="Ej. Dejar en portería o llamar al timbre..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-ananda-950 placeholder-gray-400 text-sm focus:outline-none focus:border-ananda-500 focus:ring-2 focus:ring-ananda-500/20 transition-all"
                />
              </div>

              <div className="p-4 rounded-2xl bg-ananda-100/60 border border-ananda-200 text-xs text-ananda-900 flex items-center justify-between">
                <span>🚚 Costo de envío:</span>
                <span className="font-semibold">A convenir por WhatsApp (o domicilio local)</span>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3.5 rounded-full bg-white border border-ananda-300 text-ananda-900 font-semibold text-xs hover:bg-ananda-100 transition-colors"
                >
                  ← Volver
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3.5 rounded-full bg-ananda-900 text-white font-semibold text-sm hover:bg-ananda-500 transition-all duration-300 shadow-md"
                >
                  Continuar al Pago →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* PASO 3 — PAGO & SUBIDA DE COMPROBANTE */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-ananda-400/20 shadow-xl">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-ananda-500 mb-2 block">
                Paso 3 de 4 · Pago Seguro
              </span>
              <h1 className="font-display text-3xl font-bold text-ananda-950">
                Confirmación de Pago
              </h1>
            </div>

            {/* Resumen del Pedido */}
            <div className="bg-white/80 p-5 rounded-2xl border border-ananda-100 text-sm space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Destinatario:</span>
                <span className="font-bold text-ananda-950">{shippingData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dirección:</span>
                <span className="font-bold text-ananda-950">{shippingData.address}, {shippingData.city}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-ananda-100">
                <span className="text-gray-500 font-bold uppercase text-xs">Monto Total a Pagar:</span>
                <span className="font-display text-xl font-bold text-amber-500">
                  {formatCOP(grandTotal)}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {isGatewayMode ? (
              <div className="text-center space-y-4">
                <p className="text-xs text-gray-600">
                  Serás redirigido a la pasarela Wompi para efectuar tu pago en línea.
                </p>
                <button
                  onClick={() => alert('Pasarela Wompi: Redirigiendo a checkout de e-commerce...')}
                  className="w-full py-4 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-all duration-300 shadow-md"
                >
                  Pagar con Wompi 💳
                </button>
              </div>
            ) : (
              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-ananda-900 uppercase mb-3">
                    1. Transfiere el monto a una de nuestras cuentas
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

                <div>
                  <label htmlFor="order-voucher" className="block text-xs font-bold text-ananda-900 uppercase mb-2">
                    2. Adjunta tu comprobante de pago *
                  </label>
                  <input
                    id="order-voucher"
                    type="file"
                    accept="image/*,.pdf"
                    required
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-ananda-400/30 text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-ananda-100 file:text-ananda-900 hover:file:bg-ananda-200 cursor-pointer"
                  />
                  {file && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      ✓ Archivo cargado: {file.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 py-3.5 rounded-full bg-white border border-ananda-300 text-ananda-900 font-semibold text-xs hover:bg-ananda-100 transition-colors"
                  >
                    ← Volver
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !file}
                    className="w-2/3 py-4 rounded-full bg-ananda-900 text-white font-semibold text-sm hover:bg-ananda-500 disabled:opacity-40 transition-all duration-300 shadow-lg shadow-ananda-900/20 active:scale-98"
                  >
                    {submitting ? 'Procesando Pedido...' : 'Confirmar Pedido y Pago →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* PASO 4 — CONFIRMACIÓN */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-ananda-400/30 text-center shadow-2xl">
            <span className="text-5xl block mb-4">📦</span>
            <h1 className="font-display text-3xl font-bold text-ananda-950 mb-2">
              ¡Gracias por tu Pedido!
            </h1>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Hemos registrado tu solicitud de productos. Tu comprobante de pago fue recibido para validación manual.
            </p>

            <div className="p-4 rounded-2xl bg-ananda-100/60 text-left text-xs space-y-2 mb-6 border border-ananda-200">
              <div>
                <span className="font-bold text-ananda-900">Número de Pedido:</span>{' '}
                <span className="font-mono text-ananda-500 font-bold">
                  {orderResult?.orderId || 'ORD-PENDING'}
                </span>
              </div>
              <div>
                <span className="font-bold text-ananda-900">Destinatario:</span> {shippingData.name} ({shippingData.phone})
              </div>
              <div>
                <span className="font-bold text-ananda-900">Dirección de Despacho:</span>{' '}
                {shippingData.address}, {shippingData.neighborhood}, {shippingData.city}
              </div>
              <div>
                <span className="font-bold text-ananda-900">Total Pagado:</span> {formatCOP(grandTotal)}
              </div>
            </div>

            <a
              href={getGeneralContactLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-md block text-center mb-4"
            >
              Hacer seguimiento del pedido por WhatsApp
            </a>

            <Link
              href="/tienda"
              className="text-xs font-semibold text-ananda-500 hover:underline"
            >
              Volver a la Tienda
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}