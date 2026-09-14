import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demoMode'
import { getPaymentProvider } from '@/lib/payments'
import { getRequestIp, isRateLimited } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, referenceId, amount, description, customerEmail, customerName, redirectUrl } = body

    if (!referenceId || typeof referenceId !== 'string' || referenceId.trim().length < 8) {
      return NextResponse.json(
        { error: 'Referencia de pago invÃ¡lida.' },
        { status: 400 }
      )
    }

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'El monto de pago debe ser un nÃºmero positivo.' },
        { status: 400 }
      )
    }

    const ip = getRequestIp(req.headers.get('x-forwarded-for'), req.headers.get('x-real-ip'), req.headers.get('cf-connecting-ip'))
    if (isRateLimited(`checkout-preference:${ip}`, 30, 60_000)) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en un minuto.' }, { status: 429 })
    }

    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        demo: true,
        initPoint: `${redirectUrl || '/'}?type=${type || 'booking'}&status=success&demo=true&ref=${referenceId}`,
      })
    }

    const provider = await getPaymentProvider()

    const session = await provider.createPayment({
      type: type || 'booking',
      amount: numericAmount,
      currency: 'COP',
      referenceId,
      customerEmail,
      customerName,
      description: description || 'Compra en EspÃ­ritu Ananda',
      redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout`,
    })

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      initPoint: session.redirectUrl,
      provider: session.provider,
    })
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creando preferencia de pago:', error)
    return NextResponse.json(
      { error: 'Error al generar la preferencia de pago.', details },
      { status: 500 }
    )
  }
}
