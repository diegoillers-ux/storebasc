import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demoMode'
import { MercadoPagoProvider } from '@/lib/payments/mercadopago'
import { paymentRepository } from '@/lib/supabase/repositories/payments'
import { bookingRepository } from '@/lib/supabase/repositories/bookings'
import { orderRepository } from '@/lib/supabase/repositories/orders'
import { customerRepository } from '@/lib/supabase/repositories/customers'
import { serviceRepository } from '@/lib/supabase/repositories/services'
import { productRepository } from '@/lib/supabase/repositories/products'
import { GoogleCalendarProvider } from '@/lib/calendar/google'
import { sendApprovedSaleEmail } from '@/lib/mailer'

const calendarProvider = new GoogleCalendarProvider()

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-signature') || ''
    const requestId = req.headers.get('x-request-id') || undefined
    const dataId = req.nextUrl.searchParams.get('data.id') || undefined

    if (isDemoMode()) {
      return NextResponse.json({ received: true, demo: true })
    }

    // ─── IGNORAR TOPIC MERCHANT_ORDER (solo `payment` confirma reservas/órdenes) ───
    let topicType = ''
    try {
      const parsed = JSON.parse(rawBody)
      topicType = String(parsed.type || '')
    } catch {
      topicType = new URLSearchParams(rawBody).get('type') || req.nextUrl.searchParams.get('type') || ''
    }

    if (topicType === 'merchant_order') {
      return NextResponse.json({ received: true, topic: 'merchant_order', note: 'Ignorado: se procesa vía topic payment' })
    }

    const provider = new MercadoPagoProvider()
    const event = await provider.verifyWebhook(rawBody, signature, { requestId, dataId })

    if (!event || !event.referenceId) {
      return NextResponse.json({ received: true, note: 'Sin referenceId' })
    }

    // ─── F5: COMPROBACIÓN DE IDEMPOTENCIA TOTAL ───
    const providerRef = event.providerReference || event.referenceId
    const existingPayment = await paymentRepository.getByReference(providerRef)

    if (existingPayment) {
      return NextResponse.json({ received: true, idempotent: true })
    }

    // ─── 1. SI ES UNA RESERVA DE CITA/SERVICIO ───
    const booking = await bookingRepository.getById(event.referenceId)
    if (booking && booking.id) {
      const isApproved = event.status === 'approved'

      await paymentRepository.create({
        customerId: booking.customerId,
        bookingId: booking.id,
        orderId: null,
        method: 'GATEWAY',
        provider: 'mercadopago',
        amount: event.amount || 0,
        currency: event.currency || 'COP',
        status: isApproved ? 'APPROVED' : 'REJECTED',
        reference: providerRef,
        receiptUrl: null,
        providerData: event.raw,
        verifiedAt: isApproved ? new Date() : null,
        verifiedBy: 'mercadopago-webhook',
      })

      if (isApproved && booking.status !== 'CONFIRMED') {
        const customer = await customerRepository.getById(booking.customerId)
        const service = await serviceRepository.getById(booking.serviceId)

        let calendarEventId: string | null = null
        let whatsappLink: string | null = null

        if (customer && service) {
          try {
            const startAt = booking.scheduledAt
            const endAt = new Date(startAt.getTime() + booking.durationMinutes * 60_000)
            const summary = `${service.name} - ${customer.name}`
            const description = `Consultante: ${customer.name}\nEmail: ${customer.email || 'No provisto'}\nTeléfono: ${customer.phone}\nSesión programada en Espíritu Ananda.\nNotas: ${booking.notes || 'Ninguna'}`

            const calendarEvent = await calendarProvider.createEvent({
              summary,
              description,
              startAt,
              endAt,
              attendeeEmail: customer.email || undefined,
              attendeeName: customer.name,
            })
            calendarEventId = calendarEvent.eventId

            const messageText = `Hola ${customer.name}, tu pago de $${event.amount.toLocaleString('es-CO')} ha sido aprobado con Mercado Pago. Tu sesión de "${service.name}" está CONFIRMADA para el día ${startAt.toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Bogota' })}. ¡Bendiciones!`
            whatsappLink = `https://wa.me/${customer.phone}?text=${encodeURIComponent(messageText)}`
          } catch (calErr) {
            console.error('Error sincronizando calendario en webhook Mercado Pago:', calErr)
          }

          if (customer.email) {
            sendApprovedSaleEmail({
              toEmail: customer.email,
              clientName: customer.name,
              itemName: service.name,
              dateTime: booking.scheduledAt.toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Bogota' }),
              saleType: 'service',
            }).catch(console.error)
          }
        }

        await bookingRepository.update(booking.id, {
          status: 'CONFIRMED',
          calendarEventId,
          whatsappLink,
        })
      }
    }

    // ─── 2. SI ES UN PEDIDO DE PRODUCTOS FÍSICOS ───
    const order = await orderRepository.getById(event.referenceId)
    if (order && order.id) {
      const isApproved = event.status === 'approved'

      await paymentRepository.create({
        customerId: order.customerId,
        bookingId: null,
        orderId: order.id,
        method: 'GATEWAY',
        provider: 'mercadopago',
        amount: event.amount || order.total,
        currency: event.currency || 'COP',
        status: isApproved ? 'APPROVED' : 'REJECTED',
        reference: providerRef,
        receiptUrl: null,
        providerData: event.raw,
        verifiedAt: isApproved ? new Date() : null,
        verifiedBy: 'mercadopago-webhook',
      })

      if (isApproved && order.status !== 'PAID') {
        const isPendingOrder = order.status === 'PAYMENT_PENDING' || (order.status as string) === 'PENDING'
        await orderRepository.updateStatus(order.id, 'PAID', null)

        // F2: Si venía de diferir stock (PENDING_PAYMENT), descontar stock en aprobación
        if (isPendingOrder) {
          const orderItems = await orderRepository.listItems(order.id)
          for (const item of orderItems) {
            try {
              await productRepository.adjustStock(item.productId, -item.quantity, 'venta', order.id)
            } catch (stockErr) {
              console.warn(`Error ajustando stock en webhook para ${item.productId}:`, stockErr)
            }
          }
        }

        const customer = await customerRepository.getById(order.customerId)
        if (customer && customer.email) {
          sendApprovedSaleEmail({
            toEmail: customer.email,
            clientName: customer.name,
            itemName: `Pedido ${order.id}`,
            dateTime: new Date().toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Bogota' }),
            saleType: 'product',
          }).catch(console.error)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error'
    console.error('Mercado Pago webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing error', details }, { status: 400 })
  }
}
