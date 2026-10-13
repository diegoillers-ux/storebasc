import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { paymentRepository } from '@/lib/supabase/repositories/payments';
import { bookingRepository } from '@/lib/supabase/repositories/bookings';
import { orderRepository } from '@/lib/supabase/repositories/orders';
import { customerRepository } from '@/lib/supabase/repositories/customers';
import { serviceRepository } from '@/lib/supabase/repositories/services';
import { GoogleCalendarProvider } from '@/lib/calendar/google';
import { sendApprovedSaleEmail } from '@/lib/mailer';
import { getBookingConfirmationCustomerLink } from '@/lib/whatsapp';

const calendarProvider = new GoogleCalendarProvider();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await params;
    const { status, reference } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Falta estado de actualización.' }, { status: 400 });
    }

    if (isDemoMode()) {
      return NextResponse.json({ success: true, message: 'Pago demo actualizado.' });
    }

    const payment = await paymentRepository.getById(id);
    if (!payment) {
      return NextResponse.json({ error: 'Pago no encontrado.' }, { status: 404 });
    }

    const updateData: any = {
      status,
      verifiedAt: new Date(),
      verifiedBy: 'system-admin', // ID o correo del administrador en sesión
    };

    if (reference) updateData.reference = reference;

    await paymentRepository.update(id, updateData);

    // ─── CASCADA AL APROBAR ───
    if (status === 'APPROVED') {
      // 1. Si está asociado a una Cita/Reserva
      if (payment.bookingId) {
        const booking = await bookingRepository.getById(payment.bookingId);
        if (booking && booking.status !== 'CONFIRMED') {
          const customer = await customerRepository.getById(booking.customerId);
          const service = await serviceRepository.getById(booking.serviceId);

          if (customer && service) {
            try {
              const startAt = booking.scheduledAt;
              const endAt = new Date(startAt.getTime() + booking.durationMinutes * 60_000);
              const summary = `${service.name} - ${customer.name}`;
              const description = `Consultante: ${customer.name}\nEmail: ${customer.email || 'No provisto'}\nTeléfono: ${customer.phone}\nSesión programada en Espíritu Ananda.\nNotas: ${booking.notes || 'Ninguna'}`;

              // Generar evento en Google Calendar
              const calendarEvent = await calendarProvider.createEvent({
                summary,
                description,
                startAt,
                endAt,
                attendeeEmail: customer.email || undefined,
                attendeeName: customer.name,
              });

              // Mensaje dinámico de WhatsApp
               const whatsappLink = getBookingConfirmationCustomerLink({
                 phone: customer.phone,
                 customerName: customer.name,
                 serviceName: service.name,
                 scheduledAt: startAt,
                 bookingId: payment.bookingId,
               });

              await bookingRepository.update(payment.bookingId, {
                status: 'CONFIRMED',
                calendarEventId: calendarEvent.eventId,
                whatsappLink,
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
              console.error('Error in payment-approval calendar sync cascade:', calError);
            }
          }
        }
      }

      // 2. Si está asociado a un Pedido de productos físicos
      if (payment.orderId) {
        const order = await orderRepository.getById(payment.orderId);
        if (order && order.status !== 'PAID') {
          await orderRepository.updateStatus(payment.orderId, 'PAID', null);
        }
      }
    }

    if (status === 'REJECTED' && payment.bookingId) {
      const booking = await bookingRepository.getById(payment.bookingId);
      if (booking && booking.status === 'PAYMENT_SUBMITTED') {
        await bookingRepository.update(payment.bookingId, { status: 'PENDING_PAYMENT' });
      }
    }

    return NextResponse.json({ success: true, message: 'Pago verificado correctamente.' });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al verificar pago.', details }, { status: 500 });
  }
}
