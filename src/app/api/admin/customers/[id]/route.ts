import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { bookingRepository } from '@/lib/supabase/repositories/bookings';
import { customerRepository } from '@/lib/supabase/repositories/customers';
import { orderRepository } from '@/lib/supabase/repositories/orders';
import { paymentRepository } from '@/lib/supabase/repositories/payments';
import { serviceRepository } from '@/lib/supabase/repositories/services';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await params;
    if (isDemoMode()) {
      return NextResponse.json({ customer: { id }, bookings: [], orders: [], payments: [] });
    }

    const customer = await customerRepository.getById(id);
    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 });
    }

    const [bookings, orders, payments, services] = await Promise.all([
      bookingRepository.listByCustomer(id),
      orderRepository.listByCustomer(id),
      paymentRepository.listByCustomer(id),
      serviceRepository.list(),
    ]);
    const serviceNames = new Map(services.map((service) => [service.id, service.name]));

    return NextResponse.json({
      customer,
      bookings: bookings.map((booking) => ({
        ...booking,
        serviceName: serviceNames.get(booking.serviceId) || 'Servicio no disponible',
      })),
      orders,
      payments,
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al obtener ficha del cliente.', details }, { status: 500 });
  }
}
