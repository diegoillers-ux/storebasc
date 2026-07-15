import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { bookingRepository } from '@/lib/firebase/repositories/bookings';

const MOCK_BOOKINGS = [
  { id: 'book-1', customerId: 'cust-1', serviceId: 'serv-1', scheduledAt: new Date(Date.now() + 3600000 * 2).toISOString(), durationMinutes: 60, status: 'CONFIRMED', notes: 'Desea enfatizar en el retorno de Saturno y tránsitos personales.', whatsappLink: 'https://wa.me/573123456789?text=Hola' },
  { id: 'book-2', customerId: 'cust-2', serviceId: 'serv-2', scheduledAt: new Date(Date.now() + 86400000).toISOString(), durationMinutes: 30, status: 'PAYMENT_SUBMITTED', notes: 'Comprobante de Nequi subido, espera confirmación.', whatsappLink: null },
  { id: 'book-3', customerId: 'cust-3', serviceId: 'serv-3', scheduledAt: new Date(Date.now() + 172800000).toISOString(), durationMinutes: 90, status: 'PENDING_PAYMENT', notes: 'Agendada por panel, pendiente de pago manual.', whatsappLink: null },
];

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    if (isDemoMode()) {
      return NextResponse.json({ bookings: MOCK_BOOKINGS });
    }

    const bookings = await bookingRepository.list();
    return NextResponse.json({ bookings });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al obtener reservas.', details }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { customerId, serviceId, scheduledAt, durationMinutes, notes, status } = body;

    if (!customerId || !serviceId || !scheduledAt || !durationMinutes) {
      return NextResponse.json({ error: 'Campos obligatorios faltantes.' }, { status: 400 });
    }

    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        message: 'Reserva demo creada.',
        booking: { id: 'demo-' + Math.random(), ...body },
      });
    }

    const newBooking = await bookingRepository.create({
      customerId,
      serviceId,
      adminId: null,
      scheduledAt: new Date(scheduledAt),
      durationMinutes: Number(durationMinutes),
      status: status || 'PENDING_PAYMENT',
      notes: notes || null,
      calendarEventId: null,
      whatsappLink: null,
    });

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al crear reserva.', details }, { status: 500 });
  }
}
