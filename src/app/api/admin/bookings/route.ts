import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { bookingRepository } from '@/lib/supabase/repositories/bookings';

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    if (isDemoMode()) {
      return NextResponse.json({ bookings: [] });
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
