import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demoMode'
import { bookingRepository } from '@/lib/firebase/repositories/bookings'
import { customerRepository } from '@/lib/firebase/repositories/customers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { serviceId, customerData, date, time, paymentProof } = body

    if (!customerData || !customerData.name || !customerData.email || !date || !time) {
      return NextResponse.json({ error: 'Faltan campos obligatorios para la reserva.' }, { status: 400 })
    }

    if (isDemoMode()) {
      const mockBookingId = `BNK-DEMO-${Math.floor(1000 + Math.random() * 9000)}`
      return NextResponse.json({
        success: true,
        bookingId: mockBookingId,
        message: 'Reserva simulada registrada exitosamente.',
      })
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

    // 2. Formatear fecha y hora
    const scheduledAt = new Date(`${date}T${time}:00-05:00`)

    // 3. Crear Booking en Firestore
    const newBooking = await bookingRepository.create({
      customerId,
      serviceId: serviceId || 'default-service',
      adminId: null,
      scheduledAt,
      durationMinutes: 60,
      status: 'PENDING_PAYMENT',
      notes: customerData.context ? `Notas: ${customerData.context}` : null,
      calendarEventId: null,
      whatsappLink: null,
    })

    return NextResponse.json({
      success: true,
      bookingId: newBooking.id,
      message: 'Reserva creada exitosamente y pendiente de aprobación contable.',
    })
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Error al registrar la reserva.', details }, { status: 500 })
  }
}
