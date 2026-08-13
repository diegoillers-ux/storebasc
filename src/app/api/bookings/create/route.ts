import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demoMode'
import { bookingRepository } from '@/lib/supabase/repositories/bookings'
import { customerRepository } from '@/lib/supabase/repositories/customers'
import { serviceRepository } from '@/lib/supabase/repositories/services'
import { getRequestIp, isRateLimited } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { serviceId, customerData, date, time } = body

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

    // 1. Buscar o crear cliente
    let customerId = ''
    const existingCustomers = await customerRepository.getByEmail(customerData.email)

    if (existingCustomers && existingCustomers.length > 0) {
      customerId = existingCustomers[0].id!
      // Actualizar datos
      await customerRepository.update(customerId, {
        name: customerData.name,
        phone: customerData.whatsapp || existingCustomers[0].phone,
        notes: customerData.context || existingCustomers[0].notes,
      })
    } else {
      const newCustomer = await customerRepository.create({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.whatsapp || '',
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

    return NextResponse.json({
      success: true,
      bookingId: newBooking.id,
      message: 'Reserva creada exitosamente y pendiente de aprobaciÃ³n contable.',
    })
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Error al registrar la reserva.', details }, { status: 500 })
  }
}
