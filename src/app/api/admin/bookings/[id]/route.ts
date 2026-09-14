import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { bookingRepository } from '@/lib/supabase/repositories/bookings';
import { customerRepository } from '@/lib/supabase/repositories/customers';
import { serviceRepository } from '@/lib/supabase/repositories/services';
import { GoogleCalendarProvider } from '@/lib/calendar/google';
import { sendApprovedSaleEmail } from '@/lib/mailer';
import { getBookingConfirmationCustomerLink, getBookingReminderLink } from '@/lib/whatsapp';

const calendarProvider = new GoogleCalendarProvider();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, scheduledAt, notes, durationMinutes } = body;

    if (isDemoMode()) {
      return NextResponse.json({ success: true, message: 'Reserva demo actualizada.' });
    }

    const booking = await bookingRepository.getById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Reserva no encontrada.' }, { status: 404 });
    }

    const customer = await customerRepository.getById(booking.customerId);
    const service = await serviceRepository.getById(booking.serviceId);

    if (!customer || !service) {
      return NextResponse.json({ error: 'Cliente o servicio no encontrado para esta reserva.' }, { status: 404 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
    if (notes !== undefined) updateData.notes = notes;
    if (durationMinutes !== undefined) updateData.durationMinutes = Number(durationMinutes);

    // Si cambia de estado a CONFIRMED y no tiene evento de calendario, lo creamos
    if (status === 'CONFIRMED' && booking.status !== 'CONFIRMED') {
      try {
        const startAt = scheduledAt ? new Date(scheduledAt) : booking.scheduledAt;
        const endAt = new Date(startAt.getTime() + (durationMinutes || booking.durationMinutes) * 60_000);
        
        const summary = `${service.name} - ${customer.name}`;
        const description = `Consultante: ${customer.name}\nEmail: ${customer.email || 'No provisto'}\nTeléfono: ${customer.phone}\nSesión programada en Espíritu Ananda.\nNotas: ${notes || booking.notes || 'Ninguna'}`;

        const calendarEvent = await calendarProvider.createEvent({
          summary,
          description,
          startAt,
          endAt,
          attendeeEmail: customer.email || undefined,
          attendeeName: customer.name,
        });

        updateData.calendarEventId = calendarEvent.eventId;
        
        // Enlace dinámico de WhatsApp para chatear con el cliente
         updateData.whatsappLink = getBookingConfirmationCustomerLink({
           phone: customer.phone,
           customerName: customer.name,
           serviceName: service.name,
           scheduledAt: startAt,
           bookingId: id,
         });

        // Enviar email de confirmación
        if (customer.email) {
          sendApprovedSaleEmail({
            toEmail: customer.email,
            clientName: customer.name,
            itemName: service.name,
            dateTime: startAt.toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Bogota' }),
            saleType: 'service',
          }).catch(console.error);
        }
      } catch (calError) {
        console.error('Error syncing booking with Google Calendar:', calError);
      }
    } 
    // Si ya tiene evento y se reprograma
    else if (scheduledAt !== undefined && booking.calendarEventId) {
      try {
        const startAt = new Date(scheduledAt);
        const endAt = new Date(startAt.getTime() + (durationMinutes || booking.durationMinutes) * 60_000);
        
        await calendarProvider.updateEvent({
          eventId: booking.calendarEventId,
          startAt,
          endAt,
        });

        // Actualizar enlace de WhatsApp con la nueva fecha
         updateData.whatsappLink = getBookingReminderLink({
           phone: customer.phone,
           customerName: customer.name,
           serviceName: service.name,
           scheduledAt: startAt,
         });
      } catch (calError) {
        console.error('Error rescheduling Google Calendar event:', calError);
      }
    }

    await bookingRepository.update(id, updateData);
    return NextResponse.json({ success: true, message: 'Reserva actualizada.' });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al actualizar reserva.', details }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await params;

    if (isDemoMode()) {
      return NextResponse.json({ success: true, message: 'Reserva demo eliminada.' });
    }

    const booking = await bookingRepository.getById(id);
    if (booking) {
      if (booking.calendarEventId) {
        try {
          await calendarProvider.cancelEvent(booking.calendarEventId);
        } catch (calError) {
          console.error('Error removing Google Calendar event:', calError);
        }
      }
      await bookingRepository.delete(id);
    }

    return NextResponse.json({ success: true, message: 'Reserva eliminada.' });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al eliminar reserva.', details }, { status: 500 });
  }
}
