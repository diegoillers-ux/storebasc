import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demoMode'
import { getPaymentProvider } from '@/lib/payments'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, referenceId, amount, description, customerEmail, customerName, redirectUrl } = body

    if (!referenceId || !amount) {
      return NextResponse.json(
        { error: 'Parámetros obligatorios faltantes (referenceId, amount).' },
        { status: 400 }
      )
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
      amount: Number(amount),
      currency: 'COP',
      referenceId,
      customerEmail,
      customerName,
      description: description || 'Compra en Espíritu Ananda',
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
