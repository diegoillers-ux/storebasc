import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demoMode'
import { WompiProvider } from '@/lib/payments/wompi'
import { bookingRepository } from '@/lib/supabase/repositories/bookings'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-event-checksum') || req.headers.get('x-wompi-signature') || ''

    if (isDemoMode()) {
      return NextResponse.json({ received: true, demo: true })
    }

    const provider = new WompiProvider()
    const event = await provider.verifyWebhook(rawBody, signature)

    if (event && event.status === 'approved' && event.referenceId) {
      // Buscar la reserva asociada a la referencia de pago
      const booking = await bookingRepository.getById(event.referenceId)
      if (booking && booking.id) {
        await bookingRepository.update(booking.id, {
          status: 'CONFIRMED',
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error'
    console.error('Wompi webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing error', details }, { status: 400 })
  }
}
