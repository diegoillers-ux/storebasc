import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demoMode'
import { bookingRepository } from '@/lib/supabase/repositories/bookings'
import { customerRepository } from '@/lib/supabase/repositories/customers'
import { serviceRepository } from '@/lib/supabase/repositories/services'
import { paymentRepository, type PaymentMethod } from '@/lib/supabase/repositories/payments'
import { getRequestIp, isRateLimited } from '@/lib/rateLimit'
import { sendAdminPaymentProofEmail, sendPendingSaleEmail } from '@/lib/mailer'
import { uploadPaymentProof } from '@/lib/payments/proof'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let serviceId = ''
    let customerData: Record<string, string> = {}
    let date = ''
    let time = ''
    let paymentMethod: PaymentMethod = 'TRANSFER'
    let proofFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const payload = JSON.parse(String(formData.get('payload') || '{}')) as {
        serviceId?: string
        customerData?: Record<string, string>
        date?: string
        time?: string
        paymentMethod?: PaymentMethod
      }
      serviceId = String(payload.serviceId || '')
      customerData = payload.customerData || {}
      date = String(payload.date || '')
      time = String(payload.time || '')
      paymentMethod = payload.paymentMethod || 'TRANSFER'
      const submittedProof = formData.get('proof')
      proofFile = submittedProof instanceof File ? submittedProof : null
    } else {
      const body = await req.json()
      serviceId = String(body.serviceId || '')
      customerData = body.customerData || {}
      date = String(body.date || '')
      time = String(body.time || '')
    }

    if (!customerData || !customerData.name || !customerData.email || !date || !time) {
      return NextResponse.json({ error: 'Faltan campos obligatorios para la reserva.' }, { status: 400 })
    }

    const ip = getRequestIp(req.headers.get('x-forwarded-for'), req.headers.get('x-real-ip'), req.headers.get('cf-connecting-ip'))
    if (isRateLimited(`bookings-create:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en un minuto.' }, { status: 429 })
    }

    if (isDemoMode()) {
      const mockBookingId = `BNK-DEMO-${Math.floor(1000 + Math.random() * 9000)}`
      return NextResponse.json({
        success: true,
        bookingId: mockBookingId,
        message: 'Reserva simulada registrada exitosamente.',
      })
    }

    const allowedPaymentMethods: PaymentMethod[] = ['TRANSFER', 'NEQUI', 'DAVIPLATA', 'CASH', 'GATEWAY']
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Medio de pago no válido.' }, { status: 400 })
    }

    if (contentType.includes('multipart/form-data') && !proofFile) {
      return NextResponse.json({ error: 'Debes adjuntar un comprobante.' }, { status: 400 })
    }

    // 0. Validar servicio y fecha
    const service = await serviceRepository.getById(String(serviceId || ''))
    if (!service || !service.active) {
      return NextResponse.json({ error: 'Servicio no encontrado o inactivo.' }, { status: 400 })
    }

    const scheduledAt = new Date(`${date}T${time}:00-05:00`)
    if (Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: 'Fecha u hora de reserva invÃ¡lida.' }, { status: 400 })
    }
    if (scheduledAt.getTime() < Date.now() - 5 * 60_000) {
      return NextResponse.json({ error: 'La fecha de reserva no puede estar en el pasado.' }, { status: 400 })
    }

    const overlappingBookings = await bookingRepository.listActiveByDateRange(
      scheduledAt,
      new Date(scheduledAt.getTime() + Number(service.duration || 60) * 60_000),
    )
    if (overlappingBookings.length > 0) {
      return NextResponse.json({ error: 'Ese horario ya fue tomado. Elige otro.' }, { status: 409 })
    }

    // 1. Buscar o crear cliente
    let customerId = ''
    const existingCustomers = await customerRepository.getByEmail(customerData.email)

    if (existingCustomers && existingCustomers.length > 0) {
      customerId = existingCustomers[0].id!
      // Actualizar datos
      await customerRepository.update(customerId, {
        name: customerData.name,
        phone: customerData.whatsapp || existingCustomers[0].phone,
        birthDate: customerData.birthdate || existingCustomers[0].birthDate,
        notes: customerData.context || existingCustomers[0].notes,
      })
    } else {
      const newCustomer = await customerRepository.create({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.whatsapp || '',
        birthDate: customerData.birthdate || null,
        notes: customerData.context || null,
        source: 'checkout-web',
        active: true,
      })
      customerId = newCustomer.id!
    }

    // 3. Crear Booking
    const newBooking = await bookingRepository.create({
      customerId,
      serviceId: service.id || 'default-service',
      adminId: null,
      scheduledAt,
      durationMinutes: Number(service.duration || 60),
      status: 'PENDING_PAYMENT',
      notes: customerData.context ? `Notas: ${customerData.context}` : null,
      calendarEventId: null,
      whatsappLink: null,
    })

    if (proofFile) {
      try {
        const uploadedProof = await uploadPaymentProof(proofFile, `booking-${newBooking.id}`)
        await paymentRepository.create({
          customerId,
          bookingId: newBooking.id!,
          orderId: null,
          method: paymentMethod,
          provider: 'manual',
          amount: Number(service.price),
          currency: service.currency || 'COP',
          status: 'SUBMITTED',
          reference: null,
          receiptUrl: uploadedProof.url,
          providerData: { filename: proofFile.name, contentType: proofFile.type },
          verifiedAt: null,
          verifiedBy: null,
        })
        await bookingRepository.update(newBooking.id!, { status: 'PAYMENT_SUBMITTED' })

        const dateTime = scheduledAt.toLocaleString('es-CO', {
          dateStyle: 'full',
          timeStyle: 'short',
          timeZone: 'America/Bogota',
        })
        await sendAdminPaymentProofEmail({
          eventId: newBooking.id!,
          reservationCode: newBooking.id!,
          clientName: customerData.name,
          clientEmail: customerData.email,
          serviceName: service.name,
          dateTime,
          paymentNote: customerData.context || '',
          filename: proofFile.name,
          contentType: proofFile.type,
          content: uploadedProof.buffer,
          saleType: 'service',
        })
        sendPendingSaleEmail({
          toEmail: customerData.email,
          clientName: customerData.name,
          itemName: service.name,
          dateTime,
          reservationCode: newBooking.id!,
          saleType: 'service',
        }).catch(console.error)
      } catch (proofError) {
        console.error('Error processing booking payment proof:', proofError)
        return NextResponse.json({
          error: proofError instanceof Error ? proofError.message : 'No se pudo guardar el comprobante.',
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      bookingId: newBooking.id,
      paymentSubmitted: Boolean(proofFile),
      message: proofFile
        ? 'Reserva creada y comprobante enviado. Queda pendiente de validación.'
        : 'Reserva creada exitosamente y pendiente de pago.',
    })
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Error al registrar la reserva.', details }, { status: 500 })
  }
}
